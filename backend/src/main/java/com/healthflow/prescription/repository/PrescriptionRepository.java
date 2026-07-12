package com.healthflow.prescription.repository;

import com.healthflow.prescription.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    Optional<Prescription> findByClinicIdAndPrescriptionCode(Long clinicId, String prescriptionCode);
    long countByClinicIdAndPrescriptionDateBetween(Long clinicId, LocalDate start, LocalDate end);

    // Filtered search query with support for date range, doctor, patient, and pagination
    @Query("SELECT p FROM Prescription p " +
           "LEFT JOIN FETCH p.patient pat " +
           "LEFT JOIN FETCH p.doctor doc " +
           "WHERE p.clinicId = :clinicId " +
           "AND (cast(:patientId as Long) IS NULL OR p.patientId = :patientId) " +
           "AND (cast(:doctorId as Long) IS NULL OR p.doctorId = :doctorId) " +
           "AND (cast(:fromDate as date) IS NULL OR p.prescriptionDate >= :fromDate) " +
           "AND (cast(:toDate as date) IS NULL OR p.prescriptionDate <= :toDate)")
    Page<Prescription> findFilteredPrescriptions(
            @Param("clinicId") Long clinicId,
            @Param("patientId") Long patientId,
            @Param("doctorId") Long doctorId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );
}
