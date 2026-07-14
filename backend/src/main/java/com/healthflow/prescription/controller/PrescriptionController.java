package com.healthflow.prescription.controller;

import com.healthflow.security.AuthorizationHelper;

import com.healthflow.common.dto.ApiResponse;
import com.healthflow.prescription.dto.PrescriptionRequestDto;
import com.healthflow.prescription.dto.PrescriptionResponseDto;
import com.healthflow.prescription.service.PrescriptionService;
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
@RequestMapping("/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    private final AuthorizationHelper authHelper;

    public PrescriptionController(PrescriptionService prescriptionService, AuthorizationHelper authHelper) {
        this.prescriptionService = prescriptionService;
        this.authHelper = authHelper;
    }

    // 1. Create Prescription / Save Prescription
    @PostMapping
    public ResponseEntity<ApiResponse<PrescriptionResponseDto>> createPrescription(
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @Valid @RequestBody PrescriptionRequestDto request) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        PrescriptionResponseDto response = prescriptionService.createPrescription(clinicId, request);
        return new ResponseEntity<>(
                ApiResponse.success("Prescription generated successfully", response),
                HttpStatus.CREATED
        );
    }

    // 2. View Prescription by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrescriptionResponseDto>> getPrescriptionById(
            @PathVariable("id") Long prescriptionId,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        PrescriptionResponseDto response = prescriptionService.getPrescriptionById(clinicId, prescriptionId);
        return ResponseEntity.ok(ApiResponse.success("Prescription details retrieved successfully", response));
    }

    // 3. List and filter prescriptions (e.g. by patient in timeline format, with doctor, fromDate, toDate)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PrescriptionResponseDto>>> getPrescriptions(
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @RequestParam(value = "patientId", required = false) Long patientId,
            @RequestParam(value = "doctor", required = false) Long doctorId,
            @RequestParam(value = "fromDate", required = false) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) LocalDate toDate,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "prescriptionDate") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        // Default to sorting by prescriptionDate desc for timeline format list
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<PrescriptionResponseDto> results = prescriptionService.getFilteredPrescriptions(
                clinicId, patientId, doctorId, fromDate, toDate, pageable);

        return ResponseEntity.ok(ApiResponse.success("Prescriptions timeline retrieved successfully", results));
    }

    // 4. Update / Edit Prescription
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PrescriptionResponseDto>> updatePrescription(
            @PathVariable("id") Long prescriptionId,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @Valid @RequestBody PrescriptionRequestDto request) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        PrescriptionResponseDto response = prescriptionService.updatePrescription(clinicId, prescriptionId, request);
        return ResponseEntity.ok(ApiResponse.success("Prescription updated successfully", response));
    }

    // 5. Preview data endpoint (in-memory preview without saving to DB)
    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<PrescriptionResponseDto>> previewPrescription(
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @Valid @RequestBody PrescriptionRequestDto request) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        PrescriptionResponseDto preview = prescriptionService.previewPrescription(clinicId, request);
        return ResponseEntity.ok(ApiResponse.success("Prescription preview generated successfully", preview));
    }

    // 6. Generate PDF placeholder endpoint
    @PostMapping("/{id}/pdf")
    public ResponseEntity<ApiResponse<Map<String, String>>> generatePdf(
            @PathVariable("id") Long prescriptionId,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        String pdfUrl = prescriptionService.generatePdfUrl(clinicId, prescriptionId);
        return ResponseEntity.ok(ApiResponse.success(
                "Prescription PDF document created successfully",
                Map.of("pdfUrl", pdfUrl)
        ));
    }
}
