package com.healthflow.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class InvoiceItemDto {

    private Long id;

    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;

    @NotNull(message = "Rate is required")
    private BigDecimal rate;

    private BigDecimal discountPercent = BigDecimal.ZERO;

    private BigDecimal taxPercent = BigDecimal.ZERO;

    private BigDecimal total;

    public InvoiceItemDto() {}

    public InvoiceItemDto(Long id, String itemName, Integer quantity, BigDecimal rate, 
                          BigDecimal discountPercent, BigDecimal taxPercent, BigDecimal total) {
        this.id = id;
        this.itemName = itemName;
        this.quantity = quantity;
        this.rate = rate;
        this.discountPercent = discountPercent;
        this.taxPercent = taxPercent;
        this.total = total;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public BigDecimal getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(BigDecimal discountPercent) {
        this.discountPercent = discountPercent;
    }

    public BigDecimal getTaxPercent() {
        return taxPercent;
    }

    public void setTaxPercent(BigDecimal taxPercent) {
        this.taxPercent = taxPercent;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}
