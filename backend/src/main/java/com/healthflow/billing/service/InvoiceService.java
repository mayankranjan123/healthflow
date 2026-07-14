package com.healthflow.billing.service;

import com.healthflow.billing.dto.InvoiceRequestDto;
import com.healthflow.billing.dto.InvoiceResponseDto;
import com.healthflow.billing.dto.InvoiceStatsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface InvoiceService {

    InvoiceResponseDto createInvoice(Long clinicId, InvoiceRequestDto request);

    InvoiceResponseDto getInvoiceById(Long clinicId, Long invoiceId);

    Page<InvoiceResponseDto> getFilteredInvoices(
            Long clinicId,
            String patientSearch,
            LocalDate fromDate,
            LocalDate toDate,
            String status,
            String doctorName,
            Pageable pageable
    );

    InvoiceResponseDto previewInvoice(Long clinicId, InvoiceRequestDto request);

    String generatePdfUrl(Long clinicId, Long invoiceId);

    InvoiceStatsDto getBillingStats(Long clinicId);
}
