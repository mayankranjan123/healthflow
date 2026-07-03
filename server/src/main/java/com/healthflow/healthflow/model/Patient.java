package com.healthflow.healthflow.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String patientCode;

    private String fullName;
    private String profileImageUrl;
    private String gender;
    private String mobile;
    private String email;
    private String purpose;
    private String allergies;
    private LocalDate dob;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bloodGroup;

    @Column(columnDefinition = "TEXT")
    private String existingDiseases;

    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;

    private LocalDateTime lastVisit;
    private LocalDateTime nextVisit;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
