package com.healthflow.appointment.service;

import com.healthflow.appointment.dto.AppointmentCancelRequestDto;
import com.healthflow.appointment.dto.AppointmentRequestDto;
import com.healthflow.appointment.dto.AppointmentResponseDto;
import com.healthflow.appointment.entity.Appointment;
import com.healthflow.appointment.mapper.AppointmentMapper;
import com.healthflow.appointment.repository.AppointmentRepository;
import com.healthflow.doctor.repository.DoctorRepository;
import com.healthflow.exception.InvalidWorkflowException;
import com.healthflow.exception.ResourceNotFoundException;
import com.healthflow.patient.repository.PatientRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AppointmentServiceImpl implements AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentServiceImpl.class);
    
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final EntityManager entityManager;
    private final Random random = new Random();

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  PatientRepository patientRepository,
                                  DoctorRepository doctorRepository,
                                  EntityManager entityManager) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public AppointmentResponseDto createAppointment(Long clinicId, AppointmentRequestDto request) {
        log.info("Scheduling appointment for patient ID: {} with doctor ID: {} in clinic: {}", 
                request.getPatientId(), request.getDoctorId(), clinicId);

        // 1. Verify patient exists and is active
        patientRepository.findById(request.getPatientId())
                .filter(p -> p.getClinicId().equals(clinicId))
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Active Patient not found with ID " + request.getPatientId()));

        // 2. Verify doctor exists
        doctorRepository.findByIdAndClinicId(request.getDoctorId(), clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID " + request.getDoctorId()));

        // 3. Double-booking check for same doctor and same appointment time
        boolean isDoubleBooked = appointmentRepository.existsActiveAppointmentAtTime(
                clinicId, request.getDoctorId(), request.getAppointmentDateTime(), null);
        if (isDoubleBooked) {
            throw new InvalidWorkflowException(String.format(
                    "Doctor ID %d already has a scheduled appointment at %s. Double booking is not permitted.",
                    request.getDoctorId(), request.getAppointmentDateTime()));
        }

        // 4. Create entity
        Appointment appointment = new Appointment();
        appointment.setClinicId(clinicId);
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorId(request.getDoctorId());
        appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        appointment.setAppointmentReason(request.getAppointmentReason());
        appointment.setAppointmentCode(generateUniqueAppointmentCode(clinicId));
        if (request.getVisitType() != null && !request.getVisitType().isBlank()) {
            appointment.setVisitType(request.getVisitType().trim());
        }
        
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            appointment.setStatus(request.getStatus().trim().toUpperCase());
        } else {
            appointment.setStatus("SCHEDULED");
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);
        log.info("Appointment successfully scheduled with code: {}", savedAppointment.getAppointmentCode());
        
        // Return fully populated DTO
        return getAppointmentById(clinicId, savedAppointment.getId());
    }

    @Override
    public AppointmentResponseDto getAppointmentById(Long clinicId, Long appointmentId) {
        log.debug("Fetching appointment with ID: {} in clinic: {}", appointmentId, clinicId);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .filter(a -> a.getClinicId().equals(clinicId))
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID " + appointmentId));
        return AppointmentMapper.toResponseDto(appointment);
    }

    @Override
    public Page<AppointmentResponseDto> getFilteredAppointments(
            Long clinicId,
            String doctorName,
            String status,
            Instant fromDate,
            Instant toDate,
            String patientName,
            String patientMobile,
            String visitType,
            Long patientId,
            Long doctorId,
            Pageable pageable) {
        
        log.info("Listing appointments dynamically with filters - doctorName: {}, status: {}, patientName: {}, patientMobile: {}, visitType: {}, patientId: {}, doctorId: {}", 
                doctorName, status, patientName, patientMobile, visitType, patientId, doctorId);
                
        StringBuilder jpql = new StringBuilder("SELECT a FROM Appointment a ");
        jpql.append("LEFT JOIN FETCH a.patient p ");
        jpql.append("LEFT JOIN FETCH a.doctor d ");
        jpql.append("WHERE a.clinicId = :clinicId ");
        
        if (patientId != null) {
            jpql.append("AND a.patientId = :patientId ");
        }
        if (doctorId != null) {
            jpql.append("AND a.doctorId = :doctorId ");
        }
        if (doctorName != null && !doctorName.trim().isEmpty() && !"all".equalsIgnoreCase(doctorName)) {
            jpql.append("AND (LOWER(d.firstName) LIKE :doctorPattern OR LOWER(d.lastName) LIKE :doctorPattern OR LOWER(CONCAT(d.firstName, ' ', d.lastName)) LIKE :doctorPattern) ");
        }
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("all")) {
            jpql.append("AND LOWER(a.status) = LOWER(:status) ");
        }
        if (fromDate != null) {
            jpql.append("AND a.appointmentDateTime >= :fromDate ");
        }
        if (toDate != null) {
            jpql.append("AND a.appointmentDateTime <= :toDate ");
        }
        if (patientName != null && !patientName.trim().isEmpty()) {
            jpql.append("AND (LOWER(p.fullName) LIKE :patientNamePattern OR CAST(p.id AS string) = :patientNameQuery) ");
        }
        if (patientMobile != null && !patientMobile.trim().isEmpty()) {
            jpql.append("AND LOWER(p.mobile) LIKE :patientMobilePattern ");
        }
        if (visitType != null && !visitType.trim().isEmpty() && !"all".equalsIgnoreCase(visitType)) {
            jpql.append("AND LOWER(a.visitType) = LOWER(:visitType) ");
        }
        
        // Add sorting
        if (pageable.getSort().isSorted()) {
            jpql.append("ORDER BY ");
            String order = pageable.getSort().stream()
                    .map(o -> "a." + o.getProperty() + " " + o.getDirection().name())
                    .collect(Collectors.joining(", "));
            jpql.append(order);
        } else {
            jpql.append("ORDER BY a.appointmentDateTime ASC");
        }
        
        // Build query
        TypedQuery<Appointment> query = entityManager.createQuery(jpql.toString(), Appointment.class);
        
        // Bind parameters
        query.setParameter("clinicId", clinicId);
        if (patientId != null) {
            query.setParameter("patientId", patientId);
        }
        if (doctorId != null) {
            query.setParameter("doctorId", doctorId);
        }
        if (doctorName != null && !doctorName.trim().isEmpty() && !"all".equalsIgnoreCase(doctorName)) {
            query.setParameter("doctorPattern", "%" + doctorName.trim().toLowerCase() + "%");
        }
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("all")) {
            query.setParameter("status", status.trim());
        }
        if (fromDate != null) {
            query.setParameter("fromDate", fromDate);
        }
        if (toDate != null) {
            query.setParameter("toDate", toDate);
        }
        if (patientName != null && !patientName.trim().isEmpty()) {
            query.setParameter("patientNamePattern", "%" + patientName.trim().toLowerCase() + "%");
            query.setParameter("patientNameQuery", patientName.trim());
        }
        if (patientMobile != null && !patientMobile.trim().isEmpty()) {
            query.setParameter("patientMobilePattern", "%" + patientMobile.trim().toLowerCase() + "%");
        }
        if (visitType != null && !visitType.trim().isEmpty() && !"all".equalsIgnoreCase(visitType)) {
            query.setParameter("visitType", visitType.trim());
        }
        
        // Fetch full matching list for total count
        List<Appointment> allMatching = query.getResultList();
        int totalRows = allMatching.size();
        
        // Apply pagination offsets
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        
        List<Appointment> paginated = query.getResultList();
        
        Page<Appointment> page = new PageImpl<>(paginated, pageable, totalRows);
        return page.map(AppointmentMapper::toResponseDto);
    }

    @Override
    @Transactional
    public AppointmentResponseDto cancelAppointment(Long clinicId, Long appointmentId, AppointmentCancelRequestDto cancelRequest) {
        log.warn("Cancelling appointment with ID: {} in clinic: {}, reason: {}", appointmentId, clinicId, cancelRequest.getCancellationReason());

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .filter(a -> a.getClinicId().equals(clinicId))
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID " + appointmentId));

        // Status transition validation
        validateStatusTransition(appointment.getStatus(), "CANCELLED");

        appointment.setStatus("CANCELLED");
        appointment.setCancellationReason(cancelRequest.getCancellationReason().trim());

        Appointment updated = appointmentRepository.save(appointment);
        log.info("Appointment ID: {} successfully cancelled", appointmentId);
        return getAppointmentById(clinicId, updated.getId());
     }
 
     @Override
     @Transactional
     public AppointmentResponseDto completeAppointment(Long clinicId, Long appointmentId) {
         log.info("Completing appointment with ID: {} in clinic: {}", appointmentId, clinicId);

         Appointment appointment = appointmentRepository.findById(appointmentId)
                 .filter(a -> a.getClinicId().equals(clinicId))
                 .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID " + appointmentId));

         validateStatusTransition(appointment.getStatus(), "COMPLETED");

         appointment.setStatus("COMPLETED");

         Appointment updated = appointmentRepository.save(appointment);
         log.info("Appointment ID: {} successfully completed", appointmentId);
         return getAppointmentById(clinicId, updated.getId());
     }

     @Override
     @Transactional
     public AppointmentResponseDto updateAppointment(Long clinicId, Long appointmentId, AppointmentRequestDto request) {
        log.info("Updating appointment ID: {} in clinic: {}", appointmentId, clinicId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .filter(a -> a.getClinicId().equals(clinicId))
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID " + appointmentId));

        // 1. Validate status transition (if request includes status change)
        String targetStatus = request.getStatus();
        if (targetStatus != null && !targetStatus.isBlank()) {
            validateStatusTransition(appointment.getStatus(), targetStatus.trim().toUpperCase());
            appointment.setStatus(targetStatus.trim().toUpperCase());
        }

        // If appointment is already cancelled or completed, prevent further edits
        if ("CANCELLED".equals(appointment.getStatus()) || "COMPLETED".equals(appointment.getStatus())) {
            throw new InvalidWorkflowException("Cannot update details of a completed or cancelled appointment.");
        }

        // 2. Validate patient & doctor if they are modified
        if (!appointment.getPatientId().equals(request.getPatientId())) {
            patientRepository.findById(request.getPatientId())
                    .filter(p -> p.getClinicId().equals(clinicId))
                    .filter(p -> !p.isDeleted())
                    .orElseThrow(() -> new ResourceNotFoundException("Active Patient not found with ID " + request.getPatientId()));
            appointment.setPatientId(request.getPatientId());
        }

        if (!appointment.getDoctorId().equals(request.getDoctorId())) {
            doctorRepository.findByIdAndClinicId(request.getDoctorId(), clinicId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID " + request.getDoctorId()));
            appointment.setDoctorId(request.getDoctorId());
        }

        // 3. Double-booking check if appointment time or doctor is being modified
        boolean isTimeChanged = !appointment.getAppointmentDateTime().equals(request.getAppointmentDateTime());
        boolean isDoctorChanged = !appointment.getDoctorId().equals(request.getDoctorId());
        if (isTimeChanged || isDoctorChanged) {
            boolean isDoubleBooked = appointmentRepository.existsActiveAppointmentAtTime(
                    clinicId, request.getDoctorId(), request.getAppointmentDateTime(), appointmentId);
            if (isDoubleBooked) {
                throw new InvalidWorkflowException(String.format(
                        "Doctor ID %d already has a scheduled appointment at %s. Double booking is not permitted.",
                        request.getDoctorId(), request.getAppointmentDateTime()));
            }
            appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        }

        appointment.setAppointmentReason(request.getAppointmentReason());
        if (request.getVisitType() != null && !request.getVisitType().isBlank()) {
            appointment.setVisitType(request.getVisitType().trim());
        }

        Appointment updated = appointmentRepository.save(appointment);
        log.info("Appointment ID: {} details updated successfully", appointmentId);
        return getAppointmentById(clinicId, updated.getId());
    }

    private void validateStatusTransition(String currentStatus, String targetStatus) {
        if (currentStatus.equalsIgnoreCase(targetStatus)) {
            return; // no status transition requested
        }

        if ("COMPLETED".equalsIgnoreCase(currentStatus)) {
            throw new InvalidWorkflowException("Status Transition Failed: Cannot modify a COMPLETED appointment.");
        }

        if ("CANCELLED".equalsIgnoreCase(currentStatus)) {
            throw new InvalidWorkflowException("Status Transition Failed: Cannot modify a CANCELLED appointment.");
        }

        if ("SCHEDULED".equalsIgnoreCase(currentStatus)) {
            if ("COMPLETED".equalsIgnoreCase(targetStatus) || "CANCELLED".equalsIgnoreCase(targetStatus)) {
                return; // Valid state transitions
            }
        }

        throw new InvalidWorkflowException(String.format(
                "Status Transition Failed: Invalid transition from status '%s' to '%s'.", 
                currentStatus, targetStatus));
    }

    private String generateUniqueAppointmentCode(Long clinicId) {
        String code = "";
        boolean isUnique = false;
        int attempts = 0;

        while (!isUnique && attempts < 15) {
            int number = 10000 + random.nextInt(90000); // 5 digits
            code = "APT-" + number;

            if (appointmentRepository.findByClinicIdAndAppointmentCode(clinicId, code).isEmpty()) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            code = "APT-" + (System.currentTimeMillis() % 1000000);
        }

        return code;
    }
}
