package com.healthflow.prescription.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public class PrescriptionResponseDto {

    private Long id;
    private Long clinicId;
    private String prescriptionCode;
    private Long patientId;
    private String patientName;
    private String patientMobile;
    
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    
    private LocalDate prescriptionDate;
    private String diagnosis;
    private String symptoms;
    private String clinicalNotes;
    private String testsRecommended;
    private String advice;
    private LocalDate nextVisitDate;
    private String status;
    private String pdfUrl;
    
    private Instant createdAt;
    private Instant updatedAt;
    
    private List<PrescriptionMedicineDto> medicines;

    public PrescriptionResponseDto() {}

    public PrescriptionResponseDto(Long id, Long clinicId, String prescriptionCode, Long patientId, String patientName, 
                                   String patientMobile, Long doctorId, String doctorName, String doctorSpecialization, 
                                   LocalDate prescriptionDate, String diagnosis, String symptoms, String clinicalNotes, 
                                   String testsRecommended, String advice, LocalDate nextVisitDate, String status, 
                                   String pdfUrl, Instant createdAt, Instant updatedAt, List<PrescriptionMedicineDto> medicines) {
        this.id = id;
        this.clinicId = clinicId;
        this.prescriptionCode = prescriptionCode;
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientMobile = patientMobile;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.doctorSpecialization = doctorSpecialization;
        this.prescriptionDate = prescriptionDate;
        this.diagnosis = diagnosis;
        this.symptoms = symptoms;
        this.clinicalNotes = clinicalNotes;
        this.testsRecommended = testsRecommended;
        this.advice = advice;
        this.nextVisitDate = nextVisitDate;
        this.status = status;
        this.pdfUrl = pdfUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.medicines = medicines;
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

    public String getPrescriptionCode() {
        return prescriptionCode;
    }

    public void setPrescriptionCode(String prescriptionCode) {
        this.prescriptionCode = prescriptionCode;
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

    public LocalDate getPrescriptionDate() {
        return prescriptionDate;
    }

    public void setPrescriptionDate(LocalDate prescriptionDate) {
        this.prescriptionDate = prescriptionDate;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getTestsRecommended() {
        return testsRecommended;
    }

    public void setTestsRecommended(String testsRecommended) {
        this.testsRecommended = testsRecommended;
    }

    public String getAdvice() {
        return advice;
    }

    public void setAdvice(String advice) {
        this.advice = advice;
    }

    public LocalDate getNextVisitDate() {
        return nextVisitDate;
    }

    public void setNextVisitDate(LocalDate nextVisitDate) {
        this.nextVisitDate = nextVisitDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
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

    public List<PrescriptionMedicineDto> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<PrescriptionMedicineDto> medicines) {
        this.medicines = medicines;
    }
}
