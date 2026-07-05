package com.healthflow.patient.dto;

public class MobileCheckResultDto {

    private boolean exists;
    private String message;
    private PatientResponseDto existingPatient;

    public MobileCheckResultDto() {}

    public MobileCheckResultDto(boolean exists, String message, PatientResponseDto existingPatient) {
        this.exists = exists;
        this.message = message;
        this.existingPatient = existingPatient;
    }

    // Getters and Setters
    public boolean isExists() {
        return exists;
    }

    public void setExists(boolean exists) {
        this.exists = exists;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public PatientResponseDto getExistingPatient() {
        return existingPatient;
    }

    public void setExistingPatient(PatientResponseDto existingPatient) {
        this.existingPatient = existingPatient;
    }
}
