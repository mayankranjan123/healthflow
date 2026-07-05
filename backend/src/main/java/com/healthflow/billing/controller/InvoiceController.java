package com.healthflow.billing.controller;

import com.healthflow.billing.dto.InvoiceRequestDto;
import com.healthflow.billing.dto.InvoiceResponseDto;
import com.healthflow.billing.dto.InvoiceStatsDto;
import com.healthflow.billing.service.InvoiceService;
import com.healthflow.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    // 1. Create / Save Invoice
    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceResponseDto>> createInvoice(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @Valid @RequestBody InvoiceRequestDto request) {
        InvoiceResponseDto response = invoiceService.createInvoice(clinicId, request);
        return new ResponseEntity<>(
                ApiResponse.success("Invoice generated successfully", response),
                HttpStatus.CREATED
        );
    }

    // 2. View Invoice by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponseDto>> getInvoiceById(
            @PathVariable("id") Long invoiceId,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId) {
        InvoiceResponseDto response = invoiceService.getInvoiceById(clinicId, invoiceId);
        return ResponseEntity.ok(ApiResponse.success("Invoice details retrieved successfully", response));
    }

    // 3. List Invoices with pagination & filtering
    @GetMapping
    public ResponseEntity<ApiResponse<Page<InvoiceResponseDto>>> getInvoices(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @RequestParam(value = "patientName", required = false) String patientName,
            @RequestParam(value = "invoiceSearch", required = false) String invoiceSearch,
            @RequestParam(value = "fromDate", required = false) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) LocalDate toDate,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "doctor", required = false) Long doctorId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "invoiceDate") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<InvoiceResponseDto> results = invoiceService.getFilteredInvoices(
                clinicId, patientName, invoiceSearch, fromDate, toDate, status, doctorId, pageable);

        return ResponseEntity.ok(ApiResponse.success("Invoices retrieved successfully", results));
    }

    // 4. In-Memory Preview Endpoint (before saving to database)
    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<InvoiceResponseDto>> previewInvoice(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @Valid @RequestBody InvoiceRequestDto request) {
        InvoiceResponseDto response = invoiceService.previewInvoice(clinicId, request);
        return ResponseEntity.ok(ApiResponse.success("Invoice preview generated successfully", response));
    }

    // 5. Generate PDF placeholder endpoint
    @PostMapping("/{id}/pdf")
    public ResponseEntity<ApiResponse<Map<String, String>>> generatePdf(
            @PathVariable("id") Long invoiceId,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId) {
        String pdfUrl = invoiceService.generatePdfUrl(clinicId, invoiceId);
        return ResponseEntity.ok(ApiResponse.success(
                "Invoice PDF document created successfully",
                Map.of("pdfUrl", pdfUrl)
        ));
    }

    // 6. Statistics endpoint
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<InvoiceStatsDto>> getBillingStats(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId) {
        InvoiceStatsDto stats = invoiceService.getBillingStats(clinicId);
        return ResponseEntity.ok(ApiResponse.success("Billing statistics retrieved successfully", stats));
    }
}
