package com.healthflow.patient.mapper;

import com.healthflow.patient.dto.PatientRequestDto;
import com.healthflow.patient.dto.PatientResponseDto;
import com.healthflow.patient.entity.Patient;

public class PatientMapper {

    public static PatientResponseDto toResponseDto(Patient patient) {
        if (patient == null) {
            return null;
        }
        PatientResponseDto dto = new PatientResponseDto();
        dto.setId(patient.getId());
        dto.setClinicId(patient.getClinicId());
        dto.setPatientCode(patient.getPatientCode());
        dto.setProfileImageUrl(patient.getProfileImageUrl());
        dto.setFullName(patient.getFullName());
        dto.setGender(patient.getGender());
        dto.setMobile(patient.getMobile());
        dto.setEmail(patient.getEmail());
        dto.setPurpose(patient.getPurpose());
        dto.setAllergies(patient.getAllergies());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setAddress(patient.getAddress());
        dto.setEmergencyContactName(patient.getEmergencyContactName());
        dto.setEmergencyContactPhone(patient.getEmergencyContactPhone());
        dto.setBloodGroup(patient.getBloodGroup());
        dto.setExistingDiseases(patient.getExistingDiseases());
        dto.setClinicalNotes(patient.getClinicalNotes());
        dto.setLastVisit(patient.getLastVisit());
        dto.setNextVisit(patient.getNextVisit());
        dto.setStatus(patient.getStatus());
        dto.setCreatedAt(patient.getCreatedAt());
        dto.setUpdatedAt(patient.getUpdatedAt());
        return dto;
    }

    public static Patient toEntity(PatientRequestDto dto) {
        if (dto == null) {
            return null;
        }
        Patient patient = new Patient();
        updateEntityFromDto(dto, patient);
        return patient;
    }

    public static void updateEntityFromDto(PatientRequestDto dto, Patient patient) {
        if (dto == null || patient == null) {
            return;
        }
        patient.setFullName(dto.getFullName());
        patient.setGender(dto.getGender());
        patient.setMobile(dto.getMobile());
        patient.setEmail(dto.getEmail());
        patient.setProfileImageUrl(dto.getProfileImageUrl());
        patient.setPurpose(dto.getPurpose());
        patient.setAllergies(dto.getAllergies());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setAddress(dto.getAddress());
        patient.setEmergencyContactName(dto.getEmergencyContactName());
        patient.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setExistingDiseases(dto.getExistingDiseases());
        patient.setClinicalNotes(dto.getClinicalNotes());
        
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            patient.setStatus(dto.getStatus());
        }
    }
}
