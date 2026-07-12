package com.healthflow.doctor.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.healthflow.appointment.repository.AppointmentRepository;
import com.healthflow.common.dto.ApiResponse;
import com.healthflow.doctor.entity.Doctor;
import com.healthflow.doctor.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorController(DoctorRepository doctorRepository, AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    private Long getCurrentDoctorUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.healthflow.security.UserPrincipal) {
            com.healthflow.security.UserPrincipal principal = (com.healthflow.security.UserPrincipal) auth.getPrincipal();
            boolean isDoctor = principal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));
            if (isDoctor) {
                return principal.getId();
            }
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getDoctors(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId) {
        List<Doctor> doctors = doctorRepository.findAll();
        
        Long currentDocUserId = getCurrentDoctorUserId();
        
        List<DoctorDto> dtos = doctors.stream()
                .filter(d -> d.getClinicId().equals(clinicId))
                .filter(d -> currentDocUserId == null || (d.getUserId() != null && d.getUserId().equals(currentDocUserId)))
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved successfully", dtos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorDto>> createDoctor(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @RequestBody DoctorDto dto) {
        Doctor doctor = new Doctor();
        doctor.setClinicId(clinicId);
        
        // Parse name
        String name = dto.getName() != null ? dto.getName().trim() : "";
        int lastSpaceIdx = name.lastIndexOf(" ");
        if (lastSpaceIdx > 0) {
            doctor.setFirstName(name.substring(0, lastSpaceIdx));
            doctor.setLastName(name.substring(lastSpaceIdx + 1));
        } else {
            doctor.setFirstName(name);
            doctor.setLastName("Doctor");
        }

        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getMobile());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setLicenseNumber(dto.getRegistrationNumber() != null ? dto.getRegistrationNumber() : "LIC-" + System.currentTimeMillis());
        doctor.setActive(dto.getIsActive());
        if (dto.getFee() != null && !dto.getFee().isBlank()) {
            doctor.setConsultationFees(new java.math.BigDecimal(dto.getFee()));
        }
        if (dto.getFollowupFee() != null && !dto.getFollowupFee().isBlank()) {
            doctor.setFollowupFees(new java.math.BigDecimal(dto.getFollowupFee()));
        }

        Doctor saved = doctorRepository.save(doctor);
        return ResponseEntity.ok(ApiResponse.success("Doctor created successfully", mapToDto(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDto>> updateDoctor(
            @PathVariable("id") Long doctorId,
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @RequestBody DoctorDto dto) {
        Optional<Doctor> existingOpt = doctorRepository.findById(doctorId);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Doctor doctor = existingOpt.get();
        String name = dto.getName() != null ? dto.getName().trim() : "";
        int lastSpaceIdx = name.lastIndexOf(" ");
        if (lastSpaceIdx > 0) {
            doctor.setFirstName(name.substring(0, lastSpaceIdx));
            doctor.setLastName(name.substring(lastSpaceIdx + 1));
        } else {
            doctor.setFirstName(name);
            doctor.setLastName("Doctor");
        }

        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getMobile());
        doctor.setSpecialization(dto.getSpecialization());
        if (dto.getRegistrationNumber() != null) {
            doctor.setLicenseNumber(dto.getRegistrationNumber());
        }
        doctor.setActive(dto.getIsActive());
        if (dto.getFee() != null && !dto.getFee().isBlank()) {
            doctor.setConsultationFees(new java.math.BigDecimal(dto.getFee()));
        } else {
            doctor.setConsultationFees(null);
        }
        if (dto.getFollowupFee() != null && !dto.getFollowupFee().isBlank()) {
            doctor.setFollowupFees(new java.math.BigDecimal(dto.getFollowupFee()));
        } else {
            doctor.setFollowupFees(null);
        }

        Doctor saved = doctorRepository.save(doctor);
        return ResponseEntity.ok(ApiResponse.success("Doctor updated successfully", mapToDto(saved)));
    }

    private DoctorDto mapToDto(Doctor doctor) {
        DoctorDto dto = new DoctorDto();
        dto.setId(doctor.getId().toString());
        dto.setName(doctor.getFullName());
        dto.setEmail(doctor.getEmail());
        dto.setMobile(doctor.getPhone());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setRegistrationNumber(doctor.getLicenseNumber());
        dto.setIsActive(doctor.isActive());
        
        // Static fallbacks for UI fields not persisted in database
        dto.setQualification("MD, DM");
        dto.setExperience("10 Years");
        dto.setFee(doctor.getConsultationFees() != null ? doctor.getConsultationFees().toString() : "100");
        dto.setFollowupFee(doctor.getFollowupFees() != null ? doctor.getFollowupFees().toString() : "60");
        dto.setWorkingHours("09:00 AM - 05:00 PM");
        dto.setGender("Female");
        dto.setLanguages("English, Hindi");
        dto.setAvatarUrl("https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop");

        long completedConsultations = appointmentRepository.countByClinicIdAndDoctorIdAndStatus(
                doctor.getClinicId(), doctor.getId(), "COMPLETED");
        dto.setCompletedConsultations(completedConsultations);

        return dto;
    }

    public static class DoctorDto {
        private String id;
        private String name;
        private String email;
        private String mobile;
        private String specialization;
        private String qualification;
        private String experience;
        private String fee;
        private String followupFee;
        private String workingHours;
        @JsonProperty("isActive")
        private boolean isActive;
        private String registrationNumber;
        private String gender;
        private String languages;
        private String avatarUrl;
        private long completedConsultations;

        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
        public String getQualification() { return qualification; }
        public void setQualification(String qualification) { this.qualification = qualification; }
        public String getExperience() { return experience; }
        public void setExperience(String experience) { this.experience = experience; }
        public String getFee() { return fee; }
        public void setFee(String fee) { this.fee = fee; }
        public String getFollowupFee() { return followupFee; }
        public void setFollowupFee(String followupFee) { this.followupFee = followupFee; }
        public String getWorkingHours() { return workingHours; }
        public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }
        public boolean getIsActive() { return isActive; }
        public void setIsActive(boolean active) { this.isActive = active; }
        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public String getLanguages() { return languages; }
        public void setLanguages(String languages) { this.languages = languages; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
        public long getCompletedConsultations() { return completedConsultations; }
        public void setCompletedConsultations(long completedConsultations) { this.completedConsultations = completedConsultations; }
        @JsonProperty("totalCompletedConsultations")
        public long getTotalCompletedConsultations() { return completedConsultations; }
        public void setTotalCompletedConsultations(long totalCompletedConsultations) { this.completedConsultations = totalCompletedConsultations; }
    }
}
