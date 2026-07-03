package com.healthflow.healthflow.repository;

import com.healthflow.healthflow.model.PatientFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatientFileRepository extends JpaRepository<PatientFile, Long> {
    List<PatientFile> findByPatientId(Long patientId);
}
