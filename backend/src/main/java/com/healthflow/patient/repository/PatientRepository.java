package com.healthflow.patient.repository;

import com.healthflow.patient.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    // Find all active patients within a clinic with pagination
    Page<Patient> findByClinicIdAndIsDeletedFalse(Long clinicId, Pageable pageable);
    long countByClinicIdAndIsDeletedFalse(Long clinicId);

    // Find patient by code
    Optional<Patient> findByClinicIdAndPatientCodeAndIsDeletedFalse(Long clinicId, String patientCode);

    // Find patient by mobile number (used for duplicate warning/validation check)
    Optional<Patient> findByClinicIdAndMobileAndIsDeletedFalse(Long clinicId, String mobile);

    // Search active patients within a clinic by full name, mobile, or patient code
    @Query("SELECT p FROM Patient p WHERE p.clinicId = :clinicId AND p.isDeleted = false AND " +
           "(LOWER(p.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.mobile) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.patientCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Patient> searchPatients(
            @Param("clinicId") Long clinicId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}
