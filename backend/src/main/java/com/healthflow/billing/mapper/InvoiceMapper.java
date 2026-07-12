package com.healthflow.billing.mapper;

import com.healthflow.billing.dto.InvoiceItemDto;
import com.healthflow.billing.dto.InvoiceResponseDto;
import com.healthflow.billing.entity.Invoice;
import com.healthflow.billing.entity.InvoiceItem;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class InvoiceMapper {

    public static InvoiceResponseDto toResponseDto(Invoice invoice) {
        if (invoice == null) {
            return null;
        }

        InvoiceResponseDto dto = new InvoiceResponseDto();
        dto.setId(invoice.getId());
        dto.setClinicId(invoice.getClinicId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setPatientId(invoice.getPatientId());

        if (invoice.getPatient() != null) {
            dto.setPatientName(invoice.getPatient().getFullName());
            dto.setPatientMobile(invoice.getPatient().getMobile());
        }

        dto.setDoctorId(invoice.getDoctorId());
        if (invoice.getDoctor() != null) {
            dto.setDoctorName(invoice.getDoctor().getFullName());
            dto.setDoctorSpecialization(invoice.getDoctor().getSpecialization());
        }

        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setSubtotal(invoice.getSubtotal());
        dto.setDiscountTotal(invoice.getDiscountTotal());
        dto.setTaxTotal(invoice.getTaxTotal());
        dto.setGrandTotal(invoice.getGrandTotal());
        dto.setPaidAmount(invoice.getPaidAmount());
        dto.setPendingAmount(invoice.getPendingAmount());
        dto.setStatus(invoice.getStatus());
        dto.setPaymentMode(invoice.getPaymentMode());
        dto.setReferenceNo(invoice.getReferenceNo());
        dto.setPdfUrl(invoice.getPdfUrl());
        dto.setTemplateId(invoice.getTemplateId());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setUpdatedAt(invoice.getUpdatedAt());

        if (invoice.getItems() != null) {
            List<InvoiceItemDto> itemDtos = invoice.getItems().stream()
                    .map(InvoiceMapper::toItemDto)
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
        } else {
            dto.setItems(new ArrayList<>());
        }

        return dto;
    }

    public static InvoiceItemDto toItemDto(InvoiceItem item) {
        if (item == null) {
            return null;
        }
        InvoiceItemDto dto = new InvoiceItemDto();
        dto.setId(item.getId());
        dto.setItemName(item.getItemName());
        dto.setQuantity(item.getQuantity());
        dto.setRate(item.getRate());
        dto.setDiscountPercent(item.getDiscountPercent());
        dto.setTaxPercent(item.getTaxPercent());
        dto.setTotal(item.getTotal());
        return dto;
    }
}
