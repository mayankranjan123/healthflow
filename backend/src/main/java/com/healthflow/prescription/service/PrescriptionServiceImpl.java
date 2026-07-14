package com.healthflow.prescription.service;

import com.healthflow.doctor.entity.Doctor;
import com.healthflow.doctor.repository.DoctorRepository;
import com.healthflow.exception.ResourceNotFoundException;
import com.healthflow.patient.entity.Patient;
import com.healthflow.patient.repository.PatientRepository;
import com.healthflow.prescription.dto.PrescriptionMedicineDto;
import com.healthflow.prescription.dto.PrescriptionRequestDto;
import com.healthflow.prescription.dto.PrescriptionResponseDto;
import com.healthflow.prescription.entity.Prescription;
import com.healthflow.prescription.entity.PrescriptionMedicine;
import com.healthflow.prescription.mapper.PrescriptionMapper;
import com.healthflow.prescription.repository.PrescriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@Transactional(readOnly = true)
public class PrescriptionServiceImpl implements PrescriptionService {

    private static final Logger log = LoggerFactory.getLogger(PrescriptionServiceImpl.class);

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final Random random = new Random();

    public PrescriptionServiceImpl(PrescriptionRepository prescriptionRepository,
                                   PatientRepository patientRepository,
                                   DoctorRepository doctorRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Override
    @Transactional
    public PrescriptionResponseDto createPrescription(Long clinicId, PrescriptionRequestDto request) {
        log.info("Creating new prescription for patient ID: {} by doctor ID: {} in clinic: {}", 
                request.getPatientId(), request.getDoctorId(), clinicId);

        // 1. Verify patient exists and is active
        Patient patient = patientRepository.findById(request.getPatientId())
                .filter(p -> p.getClinicId().equals(clinicId))
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Active Patient not found with ID " + request.getPatientId()));

        // 2. Verify doctor exists
        Doctor doctor = doctorRepository.findByIdAndClinicId(request.getDoctorId(), clinicId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID " + request.getDoctorId()));

        // 3. Construct entity
        Prescription prescription = new Prescription();
        prescription.setClinicId(clinicId);
        prescription.setPatientId(request.getPatientId());
        prescription.setDoctorId(request.getDoctorId());
        prescription.setPrescriptionDate(request.getPrescriptionDate());
        prescription.setDiagnosis(request.getDiagnosis().trim());
        prescription.setSymptoms(request.getSymptoms().trim());
        prescription.setClinicalNotes(request.getClinicalNotes().trim());
        prescription.setTestsRecommended(request.getTestsRecommended());
        prescription.setAdvice(request.getAdvice());
        prescription.setNextVisitDate(request.getNextVisitDate());
        prescription.setHeaderLayout(request.getHeaderLayout());
        
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            prescription.setStatus(request.getStatus().trim().toUpperCase());
        } else {
            prescription.setStatus("SAVED");
        }

        // Generate unique prescription code
        prescription.setPrescriptionCode(generateUniquePrescriptionCode(clinicId));

        // 4. Map and add prescription medicines with sequence numbers
        List<PrescriptionMedicineDto> medicineDtos = request.getMedicines();
        for (int i = 0; i < medicineDtos.size(); i++) {
            PrescriptionMedicineDto medDto = medicineDtos.get(i);
            PrescriptionMedicine med = new PrescriptionMedicine();
            med.setMedicineName(medDto.getMedicineName().trim());
            med.setDosage(medDto.getDosage().trim());
            med.setFrequency(medDto.getFrequency().trim());
            med.setDuration(medDto.getDuration().trim());
            med.setInstructions(medDto.getInstructions());
            med.setSequenceNo(medDto.getSequenceNo() != null ? medDto.getSequenceNo() : (i + 1));
            
            prescription.addMedicine(med);
        }

        Prescription saved = prescriptionRepository.save(prescription);
        log.info("Prescription saved successfully with ID: {} and Code: {}", saved.getId(), saved.getPrescriptionCode());

        // Return fully populated DTO (ensuring relationships mapped correctly)
        return getPrescriptionById(clinicId, saved.getId());
    }

    @Override
    public PrescriptionResponseDto getPrescriptionById(Long clinicId, Long prescriptionId) {
        log.debug("Fetching prescription ID: {} in clinic: {}", prescriptionId, clinicId);
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .filter(p -> p.getClinicId().equals(clinicId))
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID " + prescriptionId));
        return PrescriptionMapper.toResponseDto(prescription);
    }

    @Override
    public Page<PrescriptionResponseDto> getFilteredPrescriptions(
            Long clinicId,
            Long patientId,
            Long doctorId,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable) {
        log.info("Querying filtered prescriptions - patientId: {}, doctorId: {}, dateRange: {} to {}", 
                patientId, doctorId, fromDate, toDate);
        Page<Prescription> page = prescriptionRepository.findFilteredPrescriptions(
                clinicId, patientId, doctorId, fromDate, toDate, pageable);
        return page.map(PrescriptionMapper::toResponseDto);
    }

    @Override
    @Transactional
    public PrescriptionResponseDto updatePrescription(Long clinicId, Long prescriptionId, PrescriptionRequestDto request) {
        log.info("Updating prescription ID: {} in clinic: {}", prescriptionId, clinicId);

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .filter(p -> p.getClinicId().equals(clinicId))
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID " + prescriptionId));

        // 1. Verify patient & doctor if modified
        if (!prescription.getPatientId().equals(request.getPatientId())) {
            patientRepository.findById(request.getPatientId())
                    .filter(p -> p.getClinicId().equals(clinicId))
                    .filter(p -> !p.isDeleted())
                    .orElseThrow(() -> new ResourceNotFoundException("Active Patient not found with ID " + request.getPatientId()));
            prescription.setPatientId(request.getPatientId());
        }

        if (!prescription.getDoctorId().equals(request.getDoctorId())) {
            doctorRepository.findByIdAndClinicId(request.getDoctorId(), clinicId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID " + request.getDoctorId()));
            prescription.setDoctorId(request.getDoctorId());
        }

        // 2. Update general details
        prescription.setPrescriptionDate(request.getPrescriptionDate());
        prescription.setDiagnosis(request.getDiagnosis().trim());
        prescription.setSymptoms(request.getSymptoms().trim());
        prescription.setClinicalNotes(request.getClinicalNotes().trim());
        prescription.setTestsRecommended(request.getTestsRecommended());
        prescription.setAdvice(request.getAdvice());
        prescription.setNextVisitDate(request.getNextVisitDate());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            prescription.setStatus(request.getStatus().trim().toUpperCase());
        }

        // 3. Clear existing medicines and add new ones (standard Hibernate merge/refresh)
        prescription.getMedicines().clear();
        List<PrescriptionMedicineDto> medicineDtos = request.getMedicines();
        for (int i = 0; i < medicineDtos.size(); i++) {
            PrescriptionMedicineDto medDto = medicineDtos.get(i);
            PrescriptionMedicine med = new PrescriptionMedicine();
            med.setMedicineName(medDto.getMedicineName().trim());
            med.setDosage(medDto.getDosage().trim());
            med.setFrequency(medDto.getFrequency().trim());
            med.setDuration(medDto.getDuration().trim());
            med.setInstructions(medDto.getInstructions());
            med.setSequenceNo(medDto.getSequenceNo() != null ? medDto.getSequenceNo() : (i + 1));
            
            prescription.addMedicine(med);
        }

        Prescription updated = prescriptionRepository.save(prescription);
        log.info("Prescription ID: {} successfully updated", updated.getId());
        return getPrescriptionById(clinicId, updated.getId());
    }

    @Override
    public PrescriptionResponseDto previewPrescription(Long clinicId, PrescriptionRequestDto request) {
        log.info("Generating in-memory preview of prescription for clinic ID: {}", clinicId);

        // Fetch patient & doctor details if they exist to enrich the preview
        Patient patient = patientRepository.findById(request.getPatientId())
                .filter(p -> p.getClinicId().equals(clinicId))
                .orElse(null);

        Doctor doctor = doctorRepository.findByIdAndClinicId(request.getDoctorId(), clinicId)
                .orElse(null);

        // Construct a transient in-memory Prescription
        Prescription previewEntity = new Prescription();
        previewEntity.setClinicId(clinicId);
        previewEntity.setPatientId(request.getPatientId());
        previewEntity.setPatient(patient);
        previewEntity.setDoctorId(request.getDoctorId());
        previewEntity.setDoctor(doctor);
        previewEntity.setPrescriptionDate(request.getPrescriptionDate());
        previewEntity.setDiagnosis(request.getDiagnosis());
        previewEntity.setSymptoms(request.getSymptoms());
        previewEntity.setClinicalNotes(request.getClinicalNotes());
        previewEntity.setTestsRecommended(request.getTestsRecommended());
        previewEntity.setAdvice(request.getAdvice());
        previewEntity.setNextVisitDate(request.getNextVisitDate());
        previewEntity.setPrescriptionCode("RX-PREVIEW-DRAFT");
        previewEntity.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "DRAFT");

        List<PrescriptionMedicine> previewMeds = new ArrayList<>();
        if (request.getMedicines() != null) {
            for (int i = 0; i < request.getMedicines().size(); i++) {
                PrescriptionMedicineDto medDto = request.getMedicines().get(i);
                PrescriptionMedicine med = new PrescriptionMedicine();
                med.setMedicineName(medDto.getMedicineName());
                med.setDosage(medDto.getDosage());
                med.setFrequency(medDto.getFrequency());
                med.setDuration(medDto.getDuration());
                med.setInstructions(medDto.getInstructions());
                med.setSequenceNo(medDto.getSequenceNo() != null ? medDto.getSequenceNo() : (i + 1));
                previewEntity.addMedicine(med);
            }
        }

        return PrescriptionMapper.toResponseDto(previewEntity);
    }

    @Override
    @Transactional
    public String generatePdfUrl(Long clinicId, Long prescriptionId) {
        log.info("Generating placeholder PDF for prescription ID: {} under clinic ID: {}", prescriptionId, clinicId);
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .filter(p -> p.getClinicId().equals(clinicId))
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID " + prescriptionId));

        // Generate a standard GCS document path mock URL
        String generatedPdfUrl = String.format("prescriptions/rx-%s-%d.pdf", 
                prescription.getPrescriptionCode(), System.currentTimeMillis());
        
        prescription.setPdfUrl(generatedPdfUrl);
        prescriptionRepository.save(prescription);

        return generatedPdfUrl;
    }

    private String generateUniquePrescriptionCode(Long clinicId) {
        String code = "";
        boolean isUnique = false;
        int attempts = 0;

        while (!isUnique && attempts < 15) {
            int number = 10000 + random.nextInt(90000); // 5 digits
            code = "RX-" + number;

            if (prescriptionRepository.findByClinicIdAndPrescriptionCode(clinicId, code).isEmpty()) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            code = "RX-" + (System.currentTimeMillis() % 1000000);
        }

        return code;
    }
}
