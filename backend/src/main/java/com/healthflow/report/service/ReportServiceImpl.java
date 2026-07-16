package com.healthflow.report.service;

import com.healthflow.appointment.entity.Appointment;
import com.healthflow.appointment.repository.AppointmentRepository;
import com.healthflow.billing.entity.Invoice;
import com.healthflow.billing.repository.InvoiceRepository;
import com.healthflow.doctor.entity.Doctor;
import com.healthflow.doctor.repository.DoctorRepository;
import com.healthflow.patient.repository.PatientRepository;
import com.healthflow.prescription.repository.PrescriptionRepository;
import com.healthflow.report.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final DoctorRepository doctorRepository;
    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final PrescriptionRepository prescriptionRepository;

    public ReportServiceImpl(DoctorRepository doctorRepository,
                             InvoiceRepository invoiceRepository,
                             AppointmentRepository appointmentRepository,
                             PatientRepository patientRepository,
                             PrescriptionRepository prescriptionRepository) {
        this.doctorRepository = doctorRepository;
        this.invoiceRepository = invoiceRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    private static class DateRange {
        final LocalDate start;
        final LocalDate end;

        DateRange(LocalDate start, LocalDate end) {
            this.start = start;
            this.end = end;
        }
    }

    private DateRange resolveDateRange(String quickFilter, String fromDate, String toDate) {
        LocalDate start;
        LocalDate end;
        if (fromDate != null && !fromDate.isBlank() && toDate != null && !toDate.isBlank()) {
            start = LocalDate.parse(fromDate);
            end = LocalDate.parse(toDate);
        } else {
            LocalDate today = LocalDate.now();
            if ("WEEKLY".equalsIgnoreCase(quickFilter)) {
                start = today.minusDays(today.getDayOfWeek().getValue() - 1);
                end = start.plusDays(6);
            } else if ("MONTHLY".equalsIgnoreCase(quickFilter)) {
                start = today.withDayOfMonth(1);
                end = today.withDayOfMonth(today.lengthOfMonth());
            } else { // TODAY
                start = today;
                end = today;
            }
        }
        return new DateRange(start, end);
    }

    private DateRange getPreviousRange(LocalDate start, LocalDate end) {
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        return new DateRange(start.minusDays(days), end.minusDays(days));
    }

    private java.time.Instant toStartInstant(LocalDate date) {
        return date.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
    }

    private java.time.Instant toEndInstant(LocalDate date) {
        return date.atTime(23, 59, 59, 999999999).atZone(java.time.ZoneId.systemDefault()).toInstant();
    }

    @Override
    public ReportResponseDto getReportData(Long clinicId, String quickFilter, String fromDate, String toDate) {
        // 1. Resolve current and previous date ranges
        DateRange currentRange = resolveDateRange(quickFilter, fromDate, toDate);
        DateRange prevRange = getPreviousRange(currentRange.start, currentRange.end);

        // 2. Fetch doctors
        List<Doctor> doctors = doctorRepository.findAllByClinicId(clinicId);

        // 3. Fetch current period data
        List<Invoice> currentInvoices = invoiceRepository.findAllByClinicIdAndDateRange(
                clinicId, currentRange.start, currentRange.end
        );
        List<Appointment> currentAppointments = appointmentRepository.findAllByClinicIdAndDateRange(
                clinicId, toStartInstant(currentRange.start), toEndInstant(currentRange.end)
        );

        // 4. Fetch previous period data
        List<Invoice> prevInvoices = invoiceRepository.findAllByClinicIdAndDateRange(
                clinicId, prevRange.start, prevRange.end
        );
        List<Appointment> prevAppointments = appointmentRepository.findAllByClinicIdAndDateRange(
                clinicId, toStartInstant(prevRange.start), toEndInstant(prevRange.end)
        );

        // 5. Calculate statistics and changes
        BigDecimal totalRevenue = currentInvoices.stream()
                .map(Invoice::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal prevTotalRevenue = prevInvoices.stream()
                .map(Invoice::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        double revenueChangePercent = calculatePercentageChange(totalRevenue, prevTotalRevenue);

        long appointmentsCount = currentAppointments.size();
        long prevAppointmentsCount = prevAppointments.size();
        double appointmentsChangePercent = calculatePercentageChange(
                BigDecimal.valueOf(appointmentsCount), BigDecimal.valueOf(prevAppointmentsCount)
        );

        BigDecimal pendingPayments = currentInvoices.stream()
                .map(Invoice::getPendingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal prevPendingPayments = prevInvoices.stream()
                .map(Invoice::getPendingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        // Change logic: Reduction percentage is positive, increase is negative
        double pendingChangePercent = calculatePercentageChange(prevPendingPayments, pendingPayments);

        // 6. Monthly trend (last 6 months)
        LocalDate today = LocalDate.now();
        LocalDate sixMonthsAgoStart = today.minusMonths(5).withDayOfMonth(1);
        List<Invoice> trendInvoices = invoiceRepository.findAllByClinicIdAndDateRange(
                clinicId, sixMonthsAgoStart, today
        );
        List<Appointment> trendAppointments = appointmentRepository.findAllByClinicIdAndDateRange(
                clinicId, toStartInstant(sixMonthsAgoStart), toEndInstant(today)
        );

        List<MonthlyRevenueItem> monthlyRevenueTrend = new ArrayList<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        for (int i = 5; i >= 0; i--) {
            LocalDate d = today.minusMonths(i);
            String monthName = d.format(monthFormatter);
            int monthVal = d.getMonthValue();
            int yearVal = d.getYear();

            BigDecimal monthRevenue = trendInvoices.stream()
                    .filter(inv -> inv.getInvoiceDate().getMonthValue() == monthVal && inv.getInvoiceDate().getYear() == yearVal)
                    .map(Invoice::getPaidAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long monthAppts = trendAppointments.stream()
                    .filter(appt -> {
                        LocalDate apptDate = LocalDate.ofInstant(appt.getAppointmentDateTime(), java.time.ZoneId.systemDefault());
                        return apptDate.getMonthValue() == monthVal && apptDate.getYear() == yearVal;
                    })
                    .count();

            monthlyRevenueTrend.add(new MonthlyRevenueItem(monthName, monthRevenue, monthAppts));
        }

        // 7. Top doctor performers
        List<DoctorReportSummary> topDoctors = doctors.stream().map(doc -> {
            List<Invoice> docInvoices = currentInvoices.stream()
                    .filter(inv -> inv.getDoctorId().equals(doc.getId()))
                    .collect(Collectors.toList());

            List<Appointment> docAppts = currentAppointments.stream()
                    .filter(appt -> appt.getDoctorId().equals(doc.getId()))
                    .collect(Collectors.toList());

            BigDecimal docRev = docInvoices.stream()
                    .map(Invoice::getPaidAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal docPending = docInvoices.stream()
                    .map(Invoice::getPendingAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long completed = docAppts.stream()
                    .filter(appt -> "COMPLETED".equalsIgnoreCase(appt.getStatus()))
                    .count();

            String name = doc.getFirstName() + " " + doc.getLastName();
            String initials = getInitials(name);

            return new DoctorReportSummary(
                    doc.getId().toString(),
                    name,
                    initials,
                    doc.getSpecialization(),
                    docAppts.size(),
                    docRev,
                    docPending,
                    completed,
                    docAppts.size()
            );
        }).sorted((d1, d2) -> d2.getRevenue().compareTo(d1.getRevenue()))
          .collect(Collectors.toList());

        return new ReportResponseDto(
                totalRevenue,
                revenueChangePercent,
                appointmentsCount,
                appointmentsChangePercent,
                pendingPayments,
                pendingChangePercent,
                monthlyRevenueTrend,
                topDoctors
        );
    }

    private double calculatePercentageChange(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        BigDecimal diff = current.subtract(previous);
        BigDecimal pct = diff.multiply(BigDecimal.valueOf(100.0))
                .divide(previous, 1, RoundingMode.HALF_UP);
        return pct.doubleValue();
    }

    private String getInitials(String name) {
        if (name == null || name.isBlank()) {
            return "MD";
        }
        String[] parts = name.trim().split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                initials.append(Character.toUpperCase(part.charAt(0)));
            }
        }
        String res = initials.toString();
        return res.length() > 2 ? res.substring(0, 2) : res;
    }

    @Override
    public DashboardResponseDto getDashboardData(Long clinicId, String fromDate, String toDate) {
        LocalDate start = LocalDate.parse(fromDate);
        LocalDate end = LocalDate.parse(toDate);

        // 1. Total Patients
        long totalPatients = patientRepository.countByClinicIdAndIsDeletedFalse(clinicId);

        // 2. Appointments Today Count
        LocalDate todayDate = LocalDate.now();
        long appointmentsTodayCount = appointmentRepository.findAllByClinicIdAndDateRange(
                clinicId, toStartInstant(todayDate), toEndInstant(todayDate)
        ).size();

        // 3. Pending Billing
        BigDecimal pendingBilling = invoiceRepository.getPendingPaymentsTotal(clinicId);

        // 4. New Reports Count
        long newReportsCount = prescriptionRepository.countByClinicIdAndPrescriptionDateBetween(clinicId, start, end);

        // 5. Recent Appointments
        List<Appointment> allAppts = appointmentRepository.findAllByClinicIdAndDateRange(
                clinicId, toStartInstant(start), toEndInstant(end)
        );
        allAppts.sort((a1, a2) -> a2.getAppointmentDateTime().compareTo(a1.getAppointmentDateTime()));

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a").withZone(java.time.ZoneId.systemDefault());

        List<RecentAppointmentDto> recentAppointments = allAppts.stream().limit(5).map(appt -> {
            String timeStr = timeFormatter.format(appt.getAppointmentDateTime());
            String patName = appt.getPatient() != null ? appt.getPatient().getFullName() : "Unknown Patient";
            String docName = appt.getDoctor() != null ? appt.getDoctor().getFirstName() + " " + appt.getDoctor().getLastName() : "Unknown Doctor";
            String initials = getInitials(patName);

            String status = appt.getStatus();
            String statusText = "Scheduled";
            String statusVariant = "info";

            if ("COMPLETED".equalsIgnoreCase(status)) {
                statusVariant = "success";
                statusText = "Checked In";
            } else if ("CANCELLED".equalsIgnoreCase(status)) {
                statusVariant = "danger";
                statusText = "Cancelled";
            } else if ("SCHEDULED".equalsIgnoreCase(status)) {
                statusVariant = "info";
                statusText = "Scheduled";
            }

            return new RecentAppointmentDto(
                    appt.getId().toString(),
                    patName,
                    initials,
                    docName,
                    timeStr,
                    status,
                    statusText,
                    statusVariant
            );
        }).collect(Collectors.toList());

        // 6. Patient Flow
        LocalDate monday = todayDate.minusDays(todayDate.getDayOfWeek().getValue() - 1);
        LocalDate sunday = monday.plusDays(6);
        List<Appointment> weeklyAppts = appointmentRepository.findAllByClinicIdAndDateRange(
                clinicId, toStartInstant(monday), toEndInstant(sunday)
        );

        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        List<PatientFlowItemDto> patientFlow = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = monday.plusDays(i);
            int dayVal = d.getDayOfWeek().getValue();

            List<Appointment> dayAppts = weeklyAppts.stream()
                    .filter(appt -> {
                        LocalDate apptDate = LocalDate.ofInstant(appt.getAppointmentDateTime(), java.time.ZoneId.systemDefault());
                        return apptDate.getDayOfWeek().getValue() == dayVal;
                    })
                    .collect(Collectors.toList());

            int consultations = 0;
            int followUps = 0;
            for (Appointment appt : dayAppts) {
                String type = appt.getAppointmentReason() != null ? appt.getAppointmentReason().toLowerCase() : "";
                if (type.contains("follow")) {
                    followUps++;
                } else {
                    consultations++;
                }
            }
            patientFlow.add(new PatientFlowItemDto(days[i], consultations, followUps));
        }

        // 7. Weekly Revenue
        List<Invoice> weeklyInvoices = invoiceRepository.findAllByClinicIdAndDateRange(clinicId, monday, sunday);
        List<WeeklyRevenueItemDto> weeklyRevenue = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = monday.plusDays(i);
            BigDecimal dayRevenue = weeklyInvoices.stream()
                    .filter(inv -> inv.getInvoiceDate().equals(d))
                    .map(Invoice::getPaidAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            weeklyRevenue.add(new WeeklyRevenueItemDto(days[i], dayRevenue));
        }

        // 8. Timewise Appointments
        List<Appointment> todayAppts = appointmentRepository.findAllByClinicIdAndDateRange(
                clinicId, toStartInstant(todayDate), toEndInstant(todayDate)
        );
        String[] slots = {"08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"};
        int[] counts = new int[6];
        for (Appointment appt : todayAppts) {
            int hour = LocalDateTime.ofInstant(appt.getAppointmentDateTime(), java.time.ZoneId.systemDefault()).getHour();
            if (hour >= 8 && hour < 10) counts[0]++;
            else if (hour >= 10 && hour < 12) counts[1]++;
            else if (hour >= 12 && hour < 14) counts[2]++;
            else if (hour >= 14 && hour < 16) counts[3]++;
            else if (hour >= 16 && hour < 18) counts[4]++;
            else if (hour >= 18) counts[5]++;
        }
        List<TimewiseAppointmentDto> timewiseAppointments = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            timewiseAppointments.add(new TimewiseAppointmentDto(slots[i], counts[i]));
        }

        // Calculate Mobile Dashboard metrics
        LocalDate today = LocalDate.now();
        BigDecimal todayRevenueVal = weeklyInvoices.stream()
                .filter(inv -> inv.getInvoiceDate().equals(today))
                .map(Invoice::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long todayOpenInvoicesCount = weeklyInvoices.stream()
                .filter(inv -> inv.getInvoiceDate().equals(today) && !"paid".equalsIgnoreCase(inv.getStatus()))
                .count();

        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());
        List<Invoice> monthlyInvoices = invoiceRepository.findAllByClinicIdAndDateRange(clinicId, startOfMonth, endOfMonth);
        BigDecimal monthlyRevenueVal = monthlyInvoices.stream()
                .map(Invoice::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long appointmentsRemainingCount = todayAppts.stream()
                .filter(appt -> !"COMPLETED".equalsIgnoreCase(appt.getStatus()) && !"CANCELLED".equalsIgnoreCase(appt.getStatus()))
                .count();

        String totalPatientsChangeText = "+12% vs last month";
        String monthlyRevenueChangeText = "+15% vs last month";

        LocalDate startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDate endOfLastMonth = startOfMonth.minusDays(1);
        List<Invoice> lastMonthInvoices = invoiceRepository.findAllByClinicIdAndDateRange(clinicId, startOfLastMonth, endOfLastMonth);
        BigDecimal lastMonthRevenue = lastMonthInvoices.stream()
                .map(Invoice::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = monthlyRevenueVal.subtract(lastMonthRevenue);
            BigDecimal percentage = diff.multiply(new BigDecimal(100)).divide(lastMonthRevenue, 1, java.math.RoundingMode.HALF_UP);
            monthlyRevenueChangeText = (percentage.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "") + percentage.toString() + "% vs last month";
        }

        DashboardResponseDto dto = new DashboardResponseDto(
                totalPatients,
                appointmentsTodayCount,
                pendingBilling,
                newReportsCount,
                recentAppointments,
                patientFlow,
                weeklyRevenue,
                timewiseAppointments
        );
        dto.setTodayRevenue(todayRevenueVal);
        dto.setTodayOpenInvoicesCount(todayOpenInvoicesCount);
        dto.setMonthlyRevenue(monthlyRevenueVal);
        dto.setAppointmentsRemainingCount(appointmentsRemainingCount);
        dto.setTotalPatientsChangeText(totalPatientsChangeText);
        dto.setMonthlyRevenueChangeText(monthlyRevenueChangeText);

        return dto;
    }
}
