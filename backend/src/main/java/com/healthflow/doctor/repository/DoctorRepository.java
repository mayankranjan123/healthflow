package com.healthflow.doctor.repository;

import com.healthflow.doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByIdAndClinicIdAndIsActiveTrue(Long id, Long clinicId);
    Optional<Doctor> findByIdAndClinicId(Long id, Long clinicId);
}
