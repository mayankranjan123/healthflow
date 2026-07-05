package com.healthflow.billing.dto;

import java.math.BigDecimal;

public class InvoiceStatsDto {

    private BigDecimal revenueToday;
    private BigDecimal pendingPayments;
    
    private Long paidInvoicesCount;
    private BigDecimal paidInvoicesAmount;
    
    private Long partialPaymentsCount;
    private BigDecimal partialPaymentsAmount;

    public InvoiceStatsDto() {}

    public InvoiceStatsDto(BigDecimal revenueToday, BigDecimal pendingPayments, Long paidInvoicesCount, 
                           BigDecimal paidInvoicesAmount, Long partialPaymentsCount, BigDecimal partialPaymentsAmount) {
        this.revenueToday = revenueToday;
        this.pendingPayments = pendingPayments;
        this.paidInvoicesCount = paidInvoicesCount;
        this.paidInvoicesAmount = paidInvoicesAmount;
        this.partialPaymentsCount = partialPaymentsCount;
        this.partialPaymentsAmount = partialPaymentsAmount;
    }

    // Getters and Setters
    public BigDecimal getRevenueToday() {
        return revenueToday;
    }

    public void setRevenueToday(BigDecimal revenueToday) {
        this.revenueToday = revenueToday;
    }

    public BigDecimal getPendingPayments() {
        return pendingPayments;
    }

    public void setPendingPayments(BigDecimal pendingPayments) {
        this.pendingPayments = pendingPayments;
    }

    public Long getPaidInvoicesCount() {
        return paidInvoicesCount;
    }

    public void setPaidInvoicesCount(Long paidInvoicesCount) {
        this.paidInvoicesCount = paidInvoicesCount;
    }

    public BigDecimal getPaidInvoicesAmount() {
        return paidInvoicesAmount;
    }

    public void setPaidInvoicesAmount(BigDecimal paidInvoicesAmount) {
        this.paidInvoicesAmount = paidInvoicesAmount;
    }

    public Long getPartialPaymentsCount() {
        return partialPaymentsCount;
    }

    public void setPartialPaymentsCount(Long partialPaymentsCount) {
        this.partialPaymentsCount = partialPaymentsCount;
    }

    public BigDecimal getPartialPaymentsAmount() {
        return partialPaymentsAmount;
    }

    public void setPartialPaymentsAmount(BigDecimal partialPaymentsAmount) {
        this.partialPaymentsAmount = partialPaymentsAmount;
    }
}
