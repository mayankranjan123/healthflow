package com.healthflow.appointment.controller;

import com.healthflow.security.AuthorizationHelper;

import com.healthflow.appointment.dto.AppointmentCancelRequestDto;
import com.healthflow.appointment.dto.AppointmentRequestDto;
import com.healthflow.appointment.dto.AppointmentResponseDto;
import com.healthflow.appointment.service.AppointmentService;
import com.healthflow.common.dto.ApiResponse;
import com.healthflow.doctor.entity.Doctor;
import com.healthflow.doctor.repository.DoctorRepository;
import com.healthflow.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final DoctorRepository doctorRepository;
    private final AuthorizationHelper authHelper;

    public AppointmentController(AppointmentService appointmentService, DoctorRepository doctorRepository, AuthorizationHelper authHelper) {
        this.appointmentService = appointmentService;
        this.doctorRepository = doctorRepository;
        this.authHelper = authHelper;
    }

    private Long getCurrentDoctorId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            boolean isDoctor = principal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));
            if (isDoctor) {
                return doctorRepository.findByUserId(principal.getId())
                        .map(Doctor::getId)
                        .orElse(-1L);
            }
        }
        return null;
    }

    // 1. Create Appointment
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> createAppointment(
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @Valid @RequestBody AppointmentRequestDto request) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        AppointmentResponseDto created = appointmentService.createAppointment(clinicId, request);
        return new ResponseEntity<>(
                ApiResponse.success("Appointment scheduled successfully", created),
                HttpStatus.CREATED
        );
    }

    // 2. View Appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> getAppointmentById(
            @PathVariable("id") Long appointmentId,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        AppointmentResponseDto appointment = appointmentService.getAppointmentById(clinicId, appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment details retrieved successfully", appointment));
    }

    // 3. Search and Page list with sorting & filtering
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AppointmentResponseDto>>> getAppointments(
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @RequestParam(value = "doctorName", required = false) String doctorName,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "fromDate", required = false) Instant fromDate,
            @RequestParam(value = "toDate", required = false) Instant toDate,
            @RequestParam(value = "patientName", required = false) String patientName,
            @RequestParam(value = "patientMobile", required = false) String patientMobile,
            @RequestParam(value = "visitType", required = false) String visitType,
            @RequestParam(value = "patientId", required = false) Long patientId,
            @RequestParam(value = "doctorId", required = false) Long doctorId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size,
            @RequestParam(value = "sortBy", defaultValue = "appointmentDateTime") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir) {

        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.DESC.name())
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        String activeDoctorName = doctorName;
        Long currentDocId = getCurrentDoctorId();
        if (currentDocId != null) {
            activeDoctorName = doctorRepository.findById(currentDocId)
                    .map(d -> d.getFirstName() + " " + d.getLastName())
                    .orElse(doctorName);
        }

        Page<AppointmentResponseDto> result = appointmentService.getFilteredAppointments(
                clinicId, activeDoctorName, status, fromDate, toDate, patientName, patientMobile, visitType, patientId, doctorId, pageable);

        return ResponseEntity.ok(ApiResponse.success("Appointments list retrieved successfully", result));
    }

    // 4. Update Appointment
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> updateAppointment(
            @PathVariable("id") Long appointmentId,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @Valid @RequestBody AppointmentRequestDto request) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        AppointmentResponseDto updated = appointmentService.updateAppointment(clinicId, appointmentId, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment details updated successfully", updated));
    }

    // 5. Cancel Appointment
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> cancelAppointment(
            @PathVariable("id") Long appointmentId,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @Valid @RequestBody AppointmentCancelRequestDto cancelRequest) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        AppointmentResponseDto cancelled = appointmentService.cancelAppointment(clinicId, appointmentId, cancelRequest);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", cancelled));
    }

    // 6. Complete Appointment
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> completeAppointment(
            @PathVariable("id") Long appointmentId,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        AppointmentResponseDto completed = appointmentService.completeAppointment(clinicId, appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment marked as completed successfully", completed));
    }
}
