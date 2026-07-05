package com.healthflow.patient.entity;

import com.healthflow.common.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "patients")
public class Patient extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clinic_id", nullable = false)
    private Long clinicId = 1L; // Defaults to main clinic

    @Column(name = "patient_code", nullable = false)
    private String patientCode;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "gender", nullable = false)
    private String gender;

    @Column(name = "mobile", nullable = false)
    private String mobile;

    @Column(name = "email")
    private String email;

    @Column(name = "purpose")
    private String purpose;

    @Column(name = "allergies")
    private String allergies;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "address")
    private String address;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "existing_diseases")
    private String existingDiseases;

    @Column(name = "clinical_notes")
    private String clinicalNotes;

    @Column(name = "last_visit")
    private Instant lastVisit;

    @Column(name = "next_visit")
    private Instant nextVisit;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    // Constructors
    public Patient() {
        super();
    }

    public Patient(Long id, Long clinicId, String patientCode, String profileImageUrl, String fullName, 
                   String gender, String mobile, String email, String purpose, String allergies, 
                   LocalDate dateOfBirth, String address, String emergencyContactName, 
                   String emergencyContactPhone, String bloodGroup, String existingDiseases, 
                   String clinicalNotes, Instant lastVisit, Instant nextVisit, String status, boolean isDeleted) {
        this.id = id;
        this.clinicId = clinicId;
        this.patientCode = patientCode;
        this.profileImageUrl = profileImageUrl;
        this.fullName = fullName;
        this.gender = gender;
        this.mobile = mobile;
        this.email = email;
        this.purpose = purpose;
        this.allergies = allergies;
        this.dateOfBirth = dateOfBirth;
        this.address = address;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.bloodGroup = bloodGroup;
        this.existingDiseases = existingDiseases;
        this.clinicalNotes = clinicalNotes;
        this.lastVisit = lastVisit;
        this.nextVisit = nextVisit;
        this.status = status;
        this.isDeleted = isDeleted;
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

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getExistingDiseases() {
        return existingDiseases;
    }

    public void setExistingDiseases(String existingDiseases) {
        this.existingDiseases = existingDiseases;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public Instant getLastVisit() {
        return lastVisit;
    }

    public void setLastVisit(Instant lastVisit) {
        this.lastVisit = lastVisit;
    }

    public Instant getNextVisit() {
        return nextVisit;
    }

    public void setNextVisit(Instant nextVisit) {
        this.nextVisit = nextVisit;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }
}
