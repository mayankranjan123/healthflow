package com.healthflow.report.dto;

public class RecentAppointmentDto {
    private String id;
    private String patientName;
    private String initials;
    private String doctorName;
    private String time;
    private String status;
    private String statusText;
    private String statusVariant;

    public RecentAppointmentDto() {}

    public RecentAppointmentDto(String id, String patientName, String initials, String doctorName, 
                                String time, String status, String statusText, String statusVariant) {
        this.id = id;
        this.patientName = patientName;
        this.initials = initials;
        this.doctorName = doctorName;
        this.time = time;
        this.status = status;
        this.statusText = statusText;
        this.statusVariant = statusVariant;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatusText() {
        return statusText;
    }

    public void setStatusText(String statusText) {
        this.statusText = statusText;
    }

    public String getStatusVariant() {
        return statusVariant;
    }

    public void setStatusVariant(String statusVariant) {
        this.statusVariant = statusVariant;
    }
}
