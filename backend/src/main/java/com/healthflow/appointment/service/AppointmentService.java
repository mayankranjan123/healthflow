package com.healthflow.appointment.service;

import com.healthflow.appointment.dto.AppointmentCancelRequestDto;
import com.healthflow.appointment.dto.AppointmentRequestDto;
import com.healthflow.appointment.dto.AppointmentResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;

public interface AppointmentService {

    AppointmentResponseDto createAppointment(Long clinicId, AppointmentRequestDto request);

    AppointmentResponseDto getAppointmentById(Long clinicId, Long appointmentId);

    Page<AppointmentResponseDto> getFilteredAppointments(
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
            Pageable pageable
    );

    AppointmentResponseDto cancelAppointment(Long clinicId, Long appointmentId, AppointmentCancelRequestDto cancelRequest);

    AppointmentResponseDto updateAppointment(Long clinicId, Long appointmentId, AppointmentRequestDto request);

    AppointmentResponseDto completeAppointment(Long clinicId, Long appointmentId);
}
