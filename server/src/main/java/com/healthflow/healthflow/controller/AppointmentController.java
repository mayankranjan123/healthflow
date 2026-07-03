package com.healthflow.healthflow.controller;

import com.healthflow.healthflow.model.Appointment;
import com.healthflow.healthflow.repository.AppointmentRepository;
import com.healthflow.healthflow.repository.DoctorRepository;
import com.healthflow.healthflow.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        appointment.setAppointmentCode("APT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return appointmentRepository.save(appointment);
    }
}
