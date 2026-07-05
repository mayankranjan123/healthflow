package com.healthflow.prescription.service;

import com.healthflow.prescription.dto.PrescriptionRequestDto;
import com.healthflow.prescription.dto.PrescriptionResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PrescriptionService {

    PrescriptionResponseDto createPrescription(Long clinicId, PrescriptionRequestDto request);

    PrescriptionResponseDto getPrescriptionById(Long clinicId, Long prescriptionId);

    Page<PrescriptionResponseDto> getFilteredPrescriptions(
            Long clinicId,
            Long patientId,
            Long doctorId,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );

    PrescriptionResponseDto updatePrescription(Long clinicId, Long prescriptionId, PrescriptionRequestDto request);

    PrescriptionResponseDto previewPrescription(Long clinicId, PrescriptionRequestDto request);

    String generatePdfUrl(Long clinicId, Long prescriptionId);
}
