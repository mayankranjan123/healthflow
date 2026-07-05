package com.healthflow.appointment.repository;

import com.healthflow.appointment.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByClinicIdAndAppointmentCode(Long clinicId, String appointmentCode);

    // Double-booking check: count active (SCHEDULED) appointments for the doctor at the exact same date & time
    @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
           "WHERE a.clinicId = :clinicId " +
           "AND a.doctorId = :doctorId " +
           "AND a.appointmentDateTime = :dateTime " +
           "AND a.status = 'SCHEDULED' " +
           "AND (:excludeId IS NULL OR a.id <> :excludeId)")
    boolean existsActiveAppointmentAtTime(
            @Param("clinicId") Long clinicId,
            @Param("doctorId") Long doctorId,
            @Param("dateTime") Instant dateTime,
            @Param("excludeId") Long excludeId
    );

    long countByClinicIdAndDoctorIdAndStatus(Long clinicId, Long doctorId, String status);

}
