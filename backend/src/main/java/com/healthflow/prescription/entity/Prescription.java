package com.healthflow.prescription.entity;

import com.healthflow.common.entity.BaseEntity;
import com.healthflow.doctor.entity.Doctor;
import com.healthflow.patient.entity.Patient;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
public class Prescription extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clinic_id", nullable = false)
    private Long clinicId = 1000000000L;

    @Column(name = "prescription_code", nullable = false, unique = true)
    private String prescriptionCode;

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

    @Column(name = "prescription_date", nullable = false)
    private LocalDate prescriptionDate;

    @Column(name = "diagnosis", nullable = false)
    private String diagnosis;

    @Column(name = "symptoms", nullable = false)
    private String symptoms;

    @Column(name = "clinical_notes", nullable = false)
    private String clinicalNotes;

    @Column(name = "tests_recommended")
    private String testsRecommended;

    @Column(name = "advice")
    private String advice;

    @Column(name = "next_visit_date")
    private LocalDate nextVisitDate;

    @Column(name = "header_layout")
    private String headerLayout;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE"; // ACTIVE, SAVED, DRAFT etc.

    @Column(name = "pdf_url")
    private String pdfUrl;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescriptionMedicine> medicines = new ArrayList<>();

    public Prescription() {
        super();
    }

    public Prescription(Long id, Long clinicId, String prescriptionCode, Long patientId, Long doctorId, 
                        LocalDate prescriptionDate, String diagnosis, String symptoms, String clinicalNotes, 
                        String testsRecommended, String advice, LocalDate nextVisitDate, String status, String pdfUrl) {
        this.id = id;
        this.clinicId = clinicId;
        this.prescriptionCode = prescriptionCode;
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
        this.pdfUrl = pdfUrl;
    }

    // Helper methods for managing relationship bi-directionally
    public void addMedicine(PrescriptionMedicine medicine) {
        medicines.add(medicine);
        medicine.setPrescription(this);
    }

    public void removeMedicine(PrescriptionMedicine medicine) {
        medicines.remove(medicine);
        medicine.setPrescription(null);
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

    public String getHeaderLayout() {
        return headerLayout;
    }

    public void setHeaderLayout(String headerLayout) {
        this.headerLayout = headerLayout;
    }

    public List<PrescriptionMedicine> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<PrescriptionMedicine> medicines) {
        this.medicines = medicines;
    }
}
