package com.healthflow.appointment.mapper;

import com.healthflow.appointment.dto.AppointmentResponseDto;
import com.healthflow.appointment.entity.Appointment;

public class AppointmentMapper {

    public static AppointmentResponseDto toResponseDto(Appointment appointment) {
        if (appointment == null) {
            return null;
        }
        AppointmentResponseDto dto = new AppointmentResponseDto();
        dto.setId(appointment.getId());
        dto.setClinicId(appointment.getClinicId());
        dto.setAppointmentCode(appointment.getAppointmentCode());
        dto.setAppointmentDateTime(appointment.getAppointmentDateTime());
        dto.setPatientId(appointment.getPatientId());
        
        if (appointment.getPatient() != null) {
            dto.setPatientName(appointment.getPatient().getFullName());
            dto.setPatientMobile(appointment.getPatient().getMobile());
        }
        
        dto.setDoctorId(appointment.getDoctorId());
        if (appointment.getDoctor() != null) {
            dto.setDoctorName(appointment.getDoctor().getFullName());
            dto.setDoctorSpecialization(appointment.getDoctor().getSpecialization());
        }
        
        dto.setStatus(appointment.getStatus());
        dto.setAppointmentReason(appointment.getAppointmentReason());
        dto.setCancellationReason(appointment.getCancellationReason());
        dto.setVisitType(appointment.getVisitType());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUpdatedAt(appointment.getUpdatedAt());
        
        return dto;
    }
}
