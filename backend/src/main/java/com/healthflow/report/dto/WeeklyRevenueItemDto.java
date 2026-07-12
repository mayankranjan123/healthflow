package com.healthflow.report.dto;

import java.math.BigDecimal;

public class WeeklyRevenueItemDto {
    private String day;
    private BigDecimal revenue;

    public WeeklyRevenueItemDto() {}

    public WeeklyRevenueItemDto(String day, BigDecimal revenue) {
        this.day = day;
        this.revenue = revenue;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }
}
