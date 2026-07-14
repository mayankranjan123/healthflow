package com.healthflow.appointment.entity;

import com.healthflow.common.entity.BaseEntity;
import com.healthflow.doctor.entity.Doctor;
import com.healthflow.patient.entity.Patient;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "appointments")
public class Appointment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clinic_id", nullable = false)
    private Long clinicId = 1000000000L;

    @Column(name = "appointment_code", nullable = false)
    private String appointmentCode;

    @Column(name = "appointment_date_time", nullable = false)
    private Instant appointmentDateTime;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private Doctor doctor;

    @Column(name = "status", nullable = false)
    private String status = "SCHEDULED"; // SCHEDULED, CANCELLED, COMPLETED

    @Column(name = "appointment_reason", nullable = false)
    private String appointmentReason;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "visit_type")
    private String visitType = "In-person Visit";

    public Appointment() {
        super();
    }

    public String getVisitType() {
        return visitType;
    }

    public void setVisitType(String visitType) {
        this.visitType = visitType;
    }

    public Appointment(Long id, Long clinicId, String appointmentCode, Instant appointmentDateTime, 
                       Long patientId, Long doctorId, String status, String appointmentReason, 
                       String cancellationReason) {
        this.id = id;
        this.clinicId = clinicId;
        this.appointmentCode = appointmentCode;
        this.appointmentDateTime = appointmentDateTime;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.status = status;
        this.appointmentReason = appointmentReason;
        this.cancellationReason = cancellationReason;
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

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
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
}
