package com.healthflow.patient.dto;

import java.time.LocalDate;
import java.time.Instant;

public class PatientResponseDto {

    private Long id;
    private Long clinicId;
    private String patientCode;
    private String profileImageUrl;
    private String fullName;
    private String gender;
    private String mobile;
    private String email;
    private String purpose;
    private String allergies;
    private LocalDate dateOfBirth;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bloodGroup;
    private String existingDiseases;
    private String clinicalNotes;
    private Instant lastVisit;
    private Instant nextVisit;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public PatientResponseDto() {}

    public PatientResponseDto(Long id, Long clinicId, String patientCode, String profileImageUrl, String fullName, 
                              String gender, String mobile, String email, String purpose, String allergies, 
                              LocalDate dateOfBirth, String address, String emergencyContactName, 
                              String emergencyContactPhone, String bloodGroup, String existingDiseases, 
                              String clinicalNotes, Instant lastVisit, Instant nextVisit, String status, 
                              Instant createdAt, Instant updatedAt) {
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
}
