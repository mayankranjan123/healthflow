package com.healthflow.patient.repository;

import com.healthflow.patient.entity.PatientFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientFileRepository extends JpaRepository<PatientFile, Long> {

    @Query("SELECT f FROM PatientFile f WHERE f.patientId = :patientId AND " +
           "(:fileName IS NULL OR :fileName = '' OR LOWER(f.fileName) LIKE LOWER(CONCAT('%', :fileName, '%')))")
    Page<PatientFile> findByPatientIdAndFileNameContaining(
            @Param("patientId") Long patientId,
            @Param("fileName") String fileName,
            Pageable pageable
    );
}
