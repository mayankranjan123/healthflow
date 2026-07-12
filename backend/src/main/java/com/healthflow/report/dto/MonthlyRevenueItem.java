package com.healthflow.report.dto;

import java.math.BigDecimal;

public class MonthlyRevenueItem {
    private String month;
    private BigDecimal revenue;
    private long appointments;

    public MonthlyRevenueItem() {}

    public MonthlyRevenueItem(String month, BigDecimal revenue, long appointments) {
        this.month = month;
        this.revenue = revenue;
        this.appointments = appointments;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public long getAppointments() {
        return appointments;
    }

    public void setAppointments(long appointments) {
        this.appointments = appointments;
    }
}
