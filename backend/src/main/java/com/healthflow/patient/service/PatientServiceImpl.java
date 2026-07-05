package com.healthflow.patient.service;

import com.healthflow.exception.ResourceNotFoundException;
import com.healthflow.patient.dto.MobileCheckResultDto;
import com.healthflow.patient.dto.PatientRequestDto;
import com.healthflow.patient.dto.PatientResponseDto;
import com.healthflow.patient.entity.Patient;
import com.healthflow.patient.mapper.PatientMapper;
import com.healthflow.patient.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Random;

@Service
@Transactional(readOnly = true)
public class PatientServiceImpl implements PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientServiceImpl.class);
    private final PatientRepository patientRepository;
    private final Random random = new Random();

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    @Transactional
    public PatientResponseDto createPatient(Long clinicId, PatientRequestDto request) {
        log.info("Creating a new patient in clinic ID: {} with name: {}", clinicId, request.getFullName());

        // Create entity from request DTO
        Patient patient = PatientMapper.toEntity(request);
        patient.setClinicId(clinicId);

        // Generate a unique patient code (matching the 'PID-XXXXX' format from initial seed data)
        String generatedCode = generateUniquePatientCode(clinicId);
        patient.setPatientCode(generatedCode);

        // Run soft duplicate mobile check and log a warning if exists
        Optional<Patient> existingPatient = patientRepository.findByClinicIdAndMobileAndIsDeletedFalse(clinicId, request.getMobile());
        if (existingPatient.isPresent()) {
            log.warn("Soft duplicate warning: Patient '{}' with ID {} is already registered with mobile number '{}' in clinic {}",
                    existingPatient.get().getFullName(), existingPatient.get().getId(), request.getMobile(), clinicId);
        }

        Patient savedPatient = patientRepository.save(patient);
        log.info("Successfully created patient ID: {} with code: {}", savedPatient.getId(), savedPatient.getPatientCode());
        return PatientMapper.toResponseDto(savedPatient);
    }

    @Override
    @Transactional
    public PatientResponseDto updatePatient(Long clinicId, Long patientId, PatientRequestDto request) {
        log.info("Updating patient ID: {} in clinic ID: {}", patientId, clinicId);

        Patient patient = findActivePatientById(clinicId, patientId);
        
        // Update fields
        PatientMapper.updateEntityFromDto(request, patient);

        Patient updatedPatient = patientRepository.save(patient);
        log.info("Successfully updated patient ID: {}", updatedPatient.getId());
        return PatientMapper.toResponseDto(updatedPatient);
    }

    @Override
    public PatientResponseDto getPatientById(Long clinicId, Long patientId) {
        log.debug("Fetching patient ID: {} in clinic ID: {}", patientId, clinicId);
        Patient patient = findActivePatientById(clinicId, patientId);
        return PatientMapper.toResponseDto(patient);
    }

    @Override
    public Page<PatientResponseDto> getPatients(Long clinicId, Pageable pageable) {
        log.debug("Listing patients for clinic ID: {} with pagination", clinicId);
        Page<Patient> patientsPage = patientRepository.findByClinicIdAndIsDeletedFalse(clinicId, pageable);
        return patientsPage.map(PatientMapper::toResponseDto);
    }

    @Override
    public Page<PatientResponseDto> searchPatients(Long clinicId, String searchTerm, Pageable pageable) {
        log.info("Searching patients in clinic ID: {} with query: {}", clinicId, searchTerm);
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getPatients(clinicId, pageable);
        }
        Page<Patient> searchResults = patientRepository.searchPatients(clinicId, searchTerm.trim(), pageable);
        return searchResults.map(PatientMapper::toResponseDto);
    }

    @Override
    public MobileCheckResultDto checkMobileDuplicate(Long clinicId, String mobile) {
        log.debug("Checking duplicate mobile: {} in clinic ID: {}", mobile, clinicId);
        if (mobile == null || mobile.trim().isEmpty()) {
            return new MobileCheckResultDto(false, "Mobile number is empty", null);
        }

        Optional<Patient> existingPatient = patientRepository.findByClinicIdAndMobileAndIsDeletedFalse(clinicId, mobile.trim());
        if (existingPatient.isPresent()) {
            PatientResponseDto patientDto = PatientMapper.toResponseDto(existingPatient.get());
            String message = String.format("Warning: Mobile number is already registered to patient '%s' (Code: %s).",
                    patientDto.getFullName(), patientDto.getPatientCode());
            return new MobileCheckResultDto(true, message, patientDto);
        }

        return new MobileCheckResultDto(false, "Mobile number is unique and available.", null);
    }

    @Override
    @Transactional
    public void softDeletePatient(Long clinicId, Long patientId) {
        log.warn("Soft deleting patient ID: {} in clinic ID: {}", patientId, clinicId);
        Patient patient = findActivePatientById(clinicId, patientId);
        patient.setDeleted(true);
        patientRepository.save(patient);
        log.info("Successfully soft deleted patient ID: {}", patientId);
    }

    @Override
    @Transactional
    public PatientResponseDto updateStatus(Long clinicId, Long patientId, String status) {
        log.info("Updating status of patient ID: {} to {} in clinic ID: {}", patientId, status, clinicId);
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status value cannot be empty");
        }
        Patient patient = findActivePatientById(clinicId, patientId);
        patient.setStatus(status.trim().toUpperCase());
        Patient updatedPatient = patientRepository.save(patient);
        return PatientMapper.toResponseDto(updatedPatient);
    }

    private Patient findActivePatientById(Long clinicId, Long patientId) {
        return patientRepository.findById(patientId)
                .filter(p -> p.getClinicId().equals(clinicId))
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Patient not found with ID %d in clinic ID %d", patientId, clinicId)));
    }

    private String generateUniquePatientCode(Long clinicId) {
        String patientCode = "";
        boolean isUnique = false;
        int maxAttempts = 15;
        int attempts = 0;

        while (!isUnique && attempts < maxAttempts) {
            // Generate standard PID-XXXXX code
            int number = 10000 + random.nextInt(90000); // 5 digits
            patientCode = "PID-" + number;

            // Check if code exists in active database records
            Optional<Patient> existing = patientRepository.findByClinicIdAndPatientCodeAndIsDeletedFalse(clinicId, patientCode);
            if (existing.isEmpty()) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            // Fallback to timestamp code to ensure absolute uniqueness
            patientCode = "PID-" + System.currentTimeMillis() % 1000000;
        }

        return patientCode;
    }
}
