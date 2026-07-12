package com.healthflow.report.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponseDto {
    private long totalPatients;
    private long appointmentsTodayCount;
    private BigDecimal pendingBilling;
    private long newReportsCount;
    private List<RecentAppointmentDto> recentAppointments;
    private List<PatientFlowItemDto> patientFlow;
    private List<WeeklyRevenueItemDto> weeklyRevenue;
    private List<TimewiseAppointmentDto> timewiseAppointments;

    public DashboardResponseDto() {}

    public DashboardResponseDto(long totalPatients, long appointmentsTodayCount, BigDecimal pendingBilling, 
                                long newReportsCount, List<RecentAppointmentDto> recentAppointments, 
                                List<PatientFlowItemDto> patientFlow, List<WeeklyRevenueItemDto> weeklyRevenue, 
                                List<TimewiseAppointmentDto> timewiseAppointments) {
        this.totalPatients = totalPatients;
        this.appointmentsTodayCount = appointmentsTodayCount;
        this.pendingBilling = pendingBilling;
        this.newReportsCount = newReportsCount;
        this.recentAppointments = recentAppointments;
        this.patientFlow = patientFlow;
        this.weeklyRevenue = weeklyRevenue;
        this.timewiseAppointments = timewiseAppointments;
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getAppointmentsTodayCount() {
        return appointmentsTodayCount;
    }

    public void setAppointmentsTodayCount(long appointmentsTodayCount) {
        this.appointmentsTodayCount = appointmentsTodayCount;
    }

    public BigDecimal getPendingBilling() {
        return pendingBilling;
    }

    public void setPendingBilling(BigDecimal pendingBilling) {
        this.pendingBilling = pendingBilling;
    }

    public long getNewReportsCount() {
        return newReportsCount;
    }

    public void setNewReportsCount(long newReportsCount) {
        this.newReportsCount = newReportsCount;
    }

    public List<RecentAppointmentDto> getRecentAppointments() {
        return recentAppointments;
    }

    public void setRecentAppointments(List<RecentAppointmentDto> recentAppointments) {
        this.recentAppointments = recentAppointments;
    }

    public List<PatientFlowItemDto> getPatientFlow() {
        return patientFlow;
    }

    public void setPatientFlow(List<PatientFlowItemDto> patientFlow) {
        this.patientFlow = patientFlow;
    }

    public List<WeeklyRevenueItemDto> getWeeklyRevenue() {
        return weeklyRevenue;
    }

    public void setWeeklyRevenue(List<WeeklyRevenueItemDto> weeklyRevenue) {
        this.weeklyRevenue = weeklyRevenue;
    }

    public List<TimewiseAppointmentDto> getTimewiseAppointments() {
        return timewiseAppointments;
    }

    public void setTimewiseAppointments(List<TimewiseAppointmentDto> timewiseAppointments) {
        this.timewiseAppointments = timewiseAppointments;
    }
}
