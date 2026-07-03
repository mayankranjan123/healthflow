package com.healthflow.healthflow.repository;

import com.healthflow.healthflow.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {
}
