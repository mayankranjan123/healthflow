package com.healthflow.patient.service;

import com.healthflow.patient.dto.MobileCheckResultDto;
import com.healthflow.patient.dto.PatientRequestDto;
import com.healthflow.patient.dto.PatientResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PatientService {

    PatientResponseDto createPatient(Long clinicId, PatientRequestDto request);

    PatientResponseDto updatePatient(Long clinicId, Long patientId, PatientRequestDto request);

    PatientResponseDto getPatientById(Long clinicId, Long patientId);

    Page<PatientResponseDto> getPatients(Long clinicId, Pageable pageable);

    Page<PatientResponseDto> getFilteredPatients(
            Long clinicId,
            String patientId,
            String patientMobile,
            String patientName,
            String gender,
            Pageable pageable
    );

    MobileCheckResultDto checkMobileDuplicate(Long clinicId, String mobile);

    void softDeletePatient(Long clinicId, Long patientId);

    PatientResponseDto updateStatus(Long clinicId, Long patientId, String status);
}
