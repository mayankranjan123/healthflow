package com.healthflow.prescription.mapper;

import com.healthflow.prescription.dto.PrescriptionMedicineDto;
import com.healthflow.prescription.dto.PrescriptionResponseDto;
import com.healthflow.prescription.entity.Prescription;
import com.healthflow.prescription.entity.PrescriptionMedicine;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class PrescriptionMapper {

    public static PrescriptionResponseDto toResponseDto(Prescription prescription) {
        if (prescription == null) {
            return null;
        }

        PrescriptionResponseDto dto = new PrescriptionResponseDto();
        dto.setId(prescription.getId());
        dto.setClinicId(prescription.getClinicId());
        dto.setPrescriptionCode(prescription.getPrescriptionCode());
        dto.setPatientId(prescription.getPatientId());

        if (prescription.getPatient() != null) {
            dto.setPatientName(prescription.getPatient().getFullName());
            dto.setPatientMobile(prescription.getPatient().getMobile());
        }

        dto.setDoctorId(prescription.getDoctorId());
        if (prescription.getDoctor() != null) {
            dto.setDoctorName(prescription.getDoctor().getFullName());
            dto.setDoctorSpecialization(prescription.getDoctor().getSpecialization());
        }

        dto.setPrescriptionDate(prescription.getPrescriptionDate());
        dto.setDiagnosis(prescription.getDiagnosis());
        dto.setSymptoms(prescription.getSymptoms());
        dto.setClinicalNotes(prescription.getClinicalNotes());
        dto.setTestsRecommended(prescription.getTestsRecommended());
        dto.setAdvice(prescription.getAdvice());
        dto.setNextVisitDate(prescription.getNextVisitDate());
        dto.setStatus(prescription.getStatus());
        dto.setPdfUrl(prescription.getPdfUrl());
        dto.setCreatedAt(prescription.getCreatedAt());
        dto.setUpdatedAt(prescription.getUpdatedAt());

        if (prescription.getMedicines() != null) {
            List<PrescriptionMedicineDto> medicineDtos = prescription.getMedicines().stream()
                    .map(PrescriptionMapper::toMedicineDto)
                    .collect(Collectors.toList());
            dto.setMedicines(medicineDtos);
        } else {
            dto.setMedicines(new ArrayList<>());
        }

        return dto;
    }

    public static PrescriptionMedicineDto toMedicineDto(PrescriptionMedicine medicine) {
        if (medicine == null) {
            return null;
        }
        PrescriptionMedicineDto dto = new PrescriptionMedicineDto();
        dto.setId(medicine.getId());
        dto.setMedicineName(medicine.getMedicineName());
        dto.setDosage(medicine.getDosage());
        dto.setFrequency(medicine.getFrequency());
        dto.setDuration(medicine.getDuration());
        dto.setInstructions(medicine.getInstructions());
        dto.setSequenceNo(medicine.getSequenceNo());
        return dto;
    }
}
