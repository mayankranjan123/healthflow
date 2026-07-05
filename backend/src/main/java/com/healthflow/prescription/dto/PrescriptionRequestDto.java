package com.healthflow.prescription.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class PrescriptionRequestDto {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Prescription date is required")
    private LocalDate prescriptionDate;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Symptoms are required")
    private String symptoms;

    @NotBlank(message = "Clinical notes are required")
    private String clinicalNotes;

    private String testsRecommended;

    private String advice;

    private LocalDate nextVisitDate;

    private String status; // ACTIVE, SAVED, DRAFT, etc.

    @NotEmpty(message = "At least one medicine is required in the prescription")
    @Valid
    private List<PrescriptionMedicineDto> medicines;

    public PrescriptionRequestDto() {}

    public PrescriptionRequestDto(Long patientId, Long doctorId, LocalDate prescriptionDate, String diagnosis, 
                                  String symptoms, String clinicalNotes, String testsRecommended, String advice, 
                                  LocalDate nextVisitDate, String status, List<PrescriptionMedicineDto> medicines) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.prescriptionDate = prescriptionDate;
        this.diagnosis = diagnosis;
        this.symptoms = symptoms;
        this.clinicalNotes = clinicalNotes;
        this.testsRecommended = testsRecommended;
        this.advice = advice;
        this.nextVisitDate = nextVisitDate;
        this.status = status;
        this.medicines = medicines;
    }

    // Getters and Setters
    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
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

    public List<PrescriptionMedicineDto> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<PrescriptionMedicineDto> medicines) {
        this.medicines = medicines;
    }
}
