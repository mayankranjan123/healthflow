package com.healthflow.patient.controller;

import com.healthflow.common.dto.ApiResponse;
import com.healthflow.patient.dto.MobileCheckResultDto;
import com.healthflow.patient.dto.PatientRequestDto;
import com.healthflow.patient.dto.PatientResponseDto;
import com.healthflow.patient.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    // 1. Create Patient
    @PostMapping
    public ResponseEntity<ApiResponse<PatientResponseDto>> createPatient(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @Valid @RequestBody PatientRequestDto request) {
        PatientResponseDto createdPatient = patientService.createPatient(clinicId, request);
        return new ResponseEntity<>(
                ApiResponse.success("Patient registered successfully", createdPatient),
                HttpStatus.CREATED
        );
    }

    // 2. Update Patient
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponseDto>> updatePatient(
            @PathVariable("id") Long patientId,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @Valid @RequestBody PatientRequestDto request) {
        PatientResponseDto updatedPatient = patientService.updatePatient(clinicId, patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Patient details updated successfully", updatedPatient));
    }

    // 3. Get Patient by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponseDto>> getPatientById(
            @PathVariable("id") Long patientId,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId) {
        PatientResponseDto patient = patientService.getPatientById(clinicId, patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient records retrieved successfully", patient));
    }

    // 4. Get Paginated Patients (with Search Support)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PatientResponseDto>>> getPatients(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<PatientResponseDto> result;

        if (search != null && !search.trim().isEmpty()) {
            result = patientService.searchPatients(clinicId, search, pageable);
        } else {
            result = patientService.getPatients(clinicId, pageable);
        }

        return ResponseEntity.ok(ApiResponse.success("Patient list retrieved successfully", result));
    }

    // 5. Duplicate Mobile Warning Check
    @GetMapping("/check-mobile")
    public ResponseEntity<ApiResponse<MobileCheckResultDto>> checkMobile(
            @RequestParam("mobile") String mobile,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId) {
        MobileCheckResultDto result = patientService.checkMobileDuplicate(clinicId, mobile);
        return ResponseEntity.ok(ApiResponse.success("Mobile registration status verified", result));
    }

    // 6. Soft Delete Patient
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(
            @PathVariable("id") Long patientId,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId) {
        patientService.softDeletePatient(clinicId, patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient record marked as deleted successfully"));
    }

    // 7. Toggle Status (Active / Inactive)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PatientResponseDto>> updateStatus(
            @PathVariable("id") Long patientId,
            @RequestParam("status") String status,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId) {
        PatientResponseDto updatedPatient = patientService.updateStatus(clinicId, patientId, status);
        return ResponseEntity.ok(ApiResponse.success("Patient status updated successfully", updatedPatient));
    }
}
