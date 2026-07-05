package com.healthflow.appointment.dto;

import java.time.Instant;

public class AppointmentResponseDto {

    private Long id;
    private Long clinicId;
    private String appointmentCode;
    private Instant appointmentDateTime;
    
    private Long patientId;
    private String patientName;
    private String patientMobile;
    
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    
    private String status;
    private String appointmentReason;
    private String cancellationReason;
    private String visitType;
    
    private Instant createdAt;
    private Instant updatedAt;

    public AppointmentResponseDto() {}

    public AppointmentResponseDto(Long id, Long clinicId, String appointmentCode, Instant appointmentDateTime, 
                                  Long patientId, String patientName, String patientMobile, Long doctorId, 
                                  String doctorName, String doctorSpecialization, String status, 
                                  String appointmentReason, String cancellationReason, Instant createdAt, 
                                  Instant updatedAt) {
        this.id = id;
        this.clinicId = clinicId;
        this.appointmentCode = appointmentCode;
        this.appointmentDateTime = appointmentDateTime;
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientMobile = patientMobile;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.doctorSpecialization = doctorSpecialization;
        this.status = status;
        this.appointmentReason = appointmentReason;
        this.cancellationReason = cancellationReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClinicId() {
        return clinicId;
    }

    public void setClinicId(Long clinicId) {
        this.clinicId = clinicId;
    }

    public String getAppointmentCode() {
        return appointmentCode;
    }

    public void setAppointmentCode(String appointmentCode) {
        this.appointmentCode = appointmentCode;
    }

    public Instant getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public void setAppointmentDateTime(Instant appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientMobile() {
        return patientMobile;
    }

    public void setPatientMobile(String patientMobile) {
        this.patientMobile = patientMobile;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDoctorSpecialization() {
        return doctorSpecialization;
    }

    public void setDoctorSpecialization(String doctorSpecialization) {
        this.doctorSpecialization = doctorSpecialization;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAppointmentReason() {
        return appointmentReason;
    }

    public void setAppointmentReason(String appointmentReason) {
        this.appointmentReason = appointmentReason;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getVisitType() {
        return visitType;
    }

    public void setVisitType(String visitType) {
        this.visitType = visitType;
    }
}
