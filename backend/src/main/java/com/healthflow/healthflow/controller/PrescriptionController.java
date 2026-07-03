package com.healthflow.healthflow.controller;

import com.healthflow.healthflow.model.Prescription;
import com.healthflow.healthflow.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{patientId}/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @GetMapping
    public List<Prescription> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    @PostMapping
    public Prescription createPrescription(@PathVariable Long patientId, @RequestBody Prescription prescription) {
        prescription.setPrescriptionCode("PRX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        // Link patient ID logic would normally go here based on repo setup
        return prescriptionRepository.save(prescription);
    }
}
