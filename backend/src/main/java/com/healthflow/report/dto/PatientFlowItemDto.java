package com.healthflow.report.dto;

public class PatientFlowItemDto {
    private String name;
    private int consultations;
    private int followUps;

    public PatientFlowItemDto() {}

    public PatientFlowItemDto(String name, int consultations, int followUps) {
        this.name = name;
        this.consultations = consultations;
        this.followUps = followUps;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getConsultations() {
        return consultations;
    }

    public void setConsultations(int consultations) {
        this.consultations = consultations;
    }

    public int getFollowUps() {
        return followUps;
    }

    public void setFollowUps(int followUps) {
        this.followUps = followUps;
    }
}
