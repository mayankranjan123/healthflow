package com.healthflow.patient.controller;

import com.healthflow.security.AuthorizationHelper;

import com.healthflow.common.dto.ApiResponse;
import com.healthflow.patient.dto.MobileCheckResultDto;
import com.healthflow.patient.dto.PatientRequestDto;
import com.healthflow.patient.dto.PatientResponseDto;
import com.healthflow.patient.service.PatientService;
import com.healthflow.patient.entity.PatientFile;
import com.healthflow.patient.repository.PatientFileRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;
    private final PatientFileRepository patientFileRepository;
    private final AuthorizationHelper authHelper;

    public PatientController(PatientService patientService, PatientFileRepository patientFileRepository, AuthorizationHelper authHelper) {
        this.patientService = patientService;
        this.patientFileRepository = patientFileRepository;
        this.authHelper = authHelper;
    }

    // 1. Create Patient
    @PostMapping
    public ResponseEntity<ApiResponse<PatientResponseDto>> createPatient(
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @Valid @RequestBody PatientRequestDto request) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
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
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @Valid @RequestBody PatientRequestDto request) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        PatientResponseDto updatedPatient = patientService.updatePatient(clinicId, patientId, request);
        return ResponseEntity.ok(ApiResponse.success("Patient details updated successfully", updatedPatient));
    }

    // 3. Get Patient by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponseDto>> getPatientById(
            @PathVariable("id") Long patientId,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        PatientResponseDto patient = patientService.getPatientById(clinicId, patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient records retrieved successfully", patient));
    }

    // 4. Get Paginated Patients (with Search Support)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PatientResponseDto>>> getPatients(
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @RequestParam(value = "patientId", required = false) String patientId,
            @RequestParam(value = "patientMobile", required = false) String patientMobile,
            @RequestParam(value = "patientName", required = false) String patientName,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<PatientResponseDto> result = patientService.getFilteredPatients(
                clinicId, patientId, patientMobile, patientName, gender, pageable);

        return ResponseEntity.ok(ApiResponse.success("Patient list retrieved successfully", result));
    }

    // 5. Duplicate Mobile Warning Check
    @GetMapping("/check-mobile")
    public ResponseEntity<ApiResponse<MobileCheckResultDto>> checkMobile(
            @RequestParam("mobile") String mobile,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        MobileCheckResultDto result = patientService.checkMobileDuplicate(clinicId, mobile);
        return ResponseEntity.ok(ApiResponse.success("Mobile registration status verified", result));
    }

    // 6. Soft Delete Patient
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(
            @PathVariable("id") Long patientId,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId) {
        if (!authHelper.isAuthorized(clinicId, "ADMIN")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        patientService.softDeletePatient(clinicId, patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient record marked as deleted successfully"));
    }

    // 7. Toggle Status (Active / Inactive)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PatientResponseDto>> updateStatus(
            @PathVariable("id") Long patientId,
            @RequestParam("status") String status,
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId) {
        PatientResponseDto updatedPatient = patientService.updateStatus(clinicId, patientId, status);
        return ResponseEntity.ok(ApiResponse.success("Patient status updated successfully", updatedPatient));
    }

    // 8. Search / List Patient Files (GET with optional query param or body)
    @GetMapping("/{id}/files")
    public ResponseEntity<ApiResponse<Page<PatientFile>>> getPatientFiles(
            @PathVariable("id") Long patientId,
            @RequestParam(value = "fileName", required = false) String fileNameParam,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        
        if (!authHelper.isPatientClinicAuthorized(patientId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to patient")); }
        String fileName = fileNameParam;
        if (body != null && body.containsKey("fileName")) {
            fileName = body.get("fileName");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<PatientFile> result = patientFileRepository.findByPatientIdAndFileNameContaining(patientId, fileName, pageable);
        return ResponseEntity.ok(ApiResponse.success("Files retrieved successfully", result));
    }

    // 9. Search / List Patient Files (POST with optional body for Axios/REST client standards)
    @PostMapping("/{id}/files/search")
    public ResponseEntity<ApiResponse<Page<PatientFile>>> getPatientFilesPost(
            @PathVariable("id") Long patientId,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        
        if (!authHelper.isPatientClinicAuthorized(patientId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to patient")); }
        String fileName = "";
        if (body != null && body.containsKey("fileName")) {
            fileName = body.get("fileName");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<PatientFile> result = patientFileRepository.findByPatientIdAndFileNameContaining(patientId, fileName, pageable);
        return ResponseEntity.ok(ApiResponse.success("Files retrieved successfully", result));
    }

    // 10. Upload / Add Patient File
    @PostMapping("/{id}/files")
    public ResponseEntity<ApiResponse<PatientFile>> uploadPatientFile(
            @PathVariable("id") Long patientId,
            @RequestBody PatientFile file) {
        
        if (!authHelper.isPatientClinicAuthorized(patientId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to patient")); }
        file.setPatientId(patientId);
        if (file.getUploadedDate() == null) {
            file.setUploadedDate(java.time.LocalDate.now());
        }
        PatientFile saved = patientFileRepository.save(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("File uploaded successfully", saved));
    }

    // 11. Delete Patient File
    @DeleteMapping("/{id}/files/{fileId}")
    public ResponseEntity<ApiResponse<Void>> deletePatientFile(
            @PathVariable("id") Long patientId,
            @PathVariable("fileId") Long fileId) {
        if (!authHelper.isPatientClinicAuthorized(patientId, "ADMIN")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to patient")); }
        patientFileRepository.deleteById(fileId);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully"));
    }
}
