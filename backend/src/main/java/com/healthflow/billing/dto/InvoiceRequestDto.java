package com.healthflow.billing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InvoiceRequestDto {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;

    private BigDecimal paidAmount = BigDecimal.ZERO;

    private String status; // Paid, Pending, Partial (optional input, computed if empty)

    private String paymentMode; // Cash, Online

    private String referenceNo;

    private String templateId;

    @NotEmpty(message = "Invoice must contain at least one line item")
    @Valid
    private List<InvoiceItemDto> items;

    public InvoiceRequestDto() {}

    public InvoiceRequestDto(Long patientId, Long doctorId, LocalDate invoiceDate, BigDecimal paidAmount, 
                             String status, String paymentMode, String referenceNo, List<InvoiceItemDto> items) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.invoiceDate = invoiceDate;
        this.paidAmount = paidAmount;
        this.status = status;
        this.paymentMode = paymentMode;
        this.referenceNo = referenceNo;
        this.items = items;
    }

    // Getters and Setters
    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getReferenceNo() {
        return referenceNo;
    }

    public void setReferenceNo(String referenceNo) {
        this.referenceNo = referenceNo;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public List<InvoiceItemDto> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItemDto> items) {
        this.items = items;
    }
}
