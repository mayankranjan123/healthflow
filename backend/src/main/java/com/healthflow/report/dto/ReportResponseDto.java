package com.healthflow.report.dto;

import java.math.BigDecimal;
import java.util.List;

public class ReportResponseDto {
    private BigDecimal totalRevenue;
    private double revenueChangePercent;
    private long appointmentsCount;
    private double appointmentsChangePercent;
    private BigDecimal pendingPayments;
    private double pendingChangePercent;
    private List<MonthlyRevenueItem> monthlyRevenueTrend;
    private List<DoctorReportSummary> topDoctors;

    public ReportResponseDto() {}

    public ReportResponseDto(BigDecimal totalRevenue, double revenueChangePercent, 
                             long appointmentsCount, double appointmentsChangePercent, 
                             BigDecimal pendingPayments, double pendingChangePercent, 
                             List<MonthlyRevenueItem> monthlyRevenueTrend, 
                             List<DoctorReportSummary> topDoctors) {
        this.totalRevenue = totalRevenue;
        this.revenueChangePercent = revenueChangePercent;
        this.appointmentsCount = appointmentsCount;
        this.appointmentsChangePercent = appointmentsChangePercent;
        this.pendingPayments = pendingPayments;
        this.pendingChangePercent = pendingChangePercent;
        this.monthlyRevenueTrend = monthlyRevenueTrend;
        this.topDoctors = topDoctors;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getRevenueChangePercent() {
        return revenueChangePercent;
    }

    public void setRevenueChangePercent(double revenueChangePercent) {
        this.revenueChangePercent = revenueChangePercent;
    }

    public long getAppointmentsCount() {
        return appointmentsCount;
    }

    public void setAppointmentsCount(long appointmentsCount) {
        this.appointmentsCount = appointmentsCount;
    }

    public double getAppointmentsChangePercent() {
        return appointmentsChangePercent;
    }

    public void setAppointmentsChangePercent(double appointmentsChangePercent) {
        this.appointmentsChangePercent = appointmentsChangePercent;
    }

    public BigDecimal getPendingPayments() {
        return pendingPayments;
    }

    public void setPendingPayments(BigDecimal pendingPayments) {
        this.pendingPayments = pendingPayments;
    }

    public double getPendingChangePercent() {
        return pendingChangePercent;
    }

    public void setPendingChangePercent(double pendingChangePercent) {
        this.pendingChangePercent = pendingChangePercent;
    }

    public List<MonthlyRevenueItem> getMonthlyRevenueTrend() {
        return monthlyRevenueTrend;
    }

    public void setMonthlyRevenueTrend(List<MonthlyRevenueItem> monthlyRevenueTrend) {
        this.monthlyRevenueTrend = monthlyRevenueTrend;
    }

    public List<DoctorReportSummary> getTopDoctors() {
        return topDoctors;
    }

    public void setTopDoctors(List<DoctorReportSummary> topDoctors) {
        this.topDoctors = topDoctors;
    }
}
