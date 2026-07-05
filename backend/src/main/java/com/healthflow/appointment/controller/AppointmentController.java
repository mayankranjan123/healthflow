package com.healthflow.appointment.controller;

import com.healthflow.appointment.dto.AppointmentCancelRequestDto;
import com.healthflow.appointment.dto.AppointmentRequestDto;
import com.healthflow.appointment.dto.AppointmentResponseDto;
import com.healthflow.appointment.service.AppointmentService;
import com.healthflow.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // 1. Create Appointment
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> createAppointment(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @Valid @RequestBody AppointmentRequestDto request) {
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
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId) {
        AppointmentResponseDto appointment = appointmentService.getAppointmentById(clinicId, appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment details retrieved successfully", appointment));
    }

    // 3. Search and Page list with sorting & filtering
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AppointmentResponseDto>>> getAppointments(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @RequestParam(value = "doctor", required = false) Long doctorId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "fromDate", required = false) Instant fromDate,
            @RequestParam(value = "toDate", required = false) Instant toDate,
            @RequestParam(value = "patient", required = false) String patientQuery,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "appointmentDateTime") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.DESC.name())
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AppointmentResponseDto> result = appointmentService.getFilteredAppointments(
                clinicId, doctorId, status, fromDate, toDate, patientQuery, pageable);

        return ResponseEntity.ok(ApiResponse.success("Appointments list retrieved successfully", result));
    }

    // 4. Update Appointment
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> updateAppointment(
            @PathVariable("id") Long appointmentId,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @Valid @RequestBody AppointmentRequestDto request) {
        AppointmentResponseDto updated = appointmentService.updateAppointment(clinicId, appointmentId, request);
        return ResponseEntity.ok(ApiResponse.success("Appointment details updated successfully", updated));
    }

    // 5. Cancel Appointment
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> cancelAppointment(
            @PathVariable("id") Long appointmentId,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @Valid @RequestBody AppointmentCancelRequestDto cancelRequest) {
        AppointmentResponseDto cancelled = appointmentService.cancelAppointment(clinicId, appointmentId, cancelRequest);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", cancelled));
    }

    // 6. Complete Appointment
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> completeAppointment(
            @PathVariable("id") Long appointmentId,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId) {
        AppointmentResponseDto completed = appointmentService.completeAppointment(clinicId, appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment marked as completed successfully", completed));
    }
}
