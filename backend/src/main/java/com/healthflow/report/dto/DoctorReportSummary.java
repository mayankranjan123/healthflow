package com.healthflow.report.dto;

import java.math.BigDecimal;

public class DoctorReportSummary {
    private String id;
    private String name;
    private String initials;
    private String specialization;
    private long appointments;
    private BigDecimal revenue;
    private BigDecimal pending;
    private long completedConsultations;
    private long totalConsultations;

    public DoctorReportSummary() {}

    public DoctorReportSummary(String id, String name, String initials, String specialization, 
                               long appointments, BigDecimal revenue, BigDecimal pending, 
                               long completedConsultations, long totalConsultations) {
        this.id = id;
        this.name = name;
        this.initials = initials;
        this.specialization = specialization;
        this.appointments = appointments;
        this.revenue = revenue;
        this.pending = pending;
        this.completedConsultations = completedConsultations;
        this.totalConsultations = totalConsultations;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public long getAppointments() {
        return appointments;
    }

    public void setAppointments(long appointments) {
        this.appointments = appointments;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public BigDecimal getPending() {
        return pending;
    }

    public void setPending(BigDecimal pending) {
        this.pending = pending;
    }

    public long getCompletedConsultations() {
        return completedConsultations;
    }

    public void setCompletedConsultations(long completedConsultations) {
        this.completedConsultations = completedConsultations;
    }

    public long getTotalConsultations() {
        return totalConsultations;
    }

    public void setTotalConsultations(long totalConsultations) {
        this.totalConsultations = totalConsultations;
    }
}
