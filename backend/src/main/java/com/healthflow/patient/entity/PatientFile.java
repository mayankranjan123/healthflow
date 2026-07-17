package com.healthflow.patient.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "patient_files")
public class PatientFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "uploaded_date", nullable = false)
    private LocalDate uploadedDate;

    @Column(name = "category")
    private String category;

    @Column(name = "size")
    private String size;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "upload_id")
    private String uploadId;

    public PatientFile() {}

    public PatientFile(Long patientId, String fileName, LocalDate uploadedDate, String category, String size, String fileType) {
        this.patientId = patientId;
        this.fileName = fileName;
        this.uploadedDate = uploadedDate;
        this.category = category;
        this.size = size;
        this.fileType = fileType;
    }

    public PatientFile(Long patientId, String fileName, LocalDate uploadedDate, String category, String size, String fileType, String uploadId) {
        this.patientId = patientId;
        this.fileName = fileName;
        this.uploadedDate = uploadedDate;
        this.category = category;
        this.size = size;
        this.fileType = fileType;
        this.uploadId = uploadId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public LocalDate getUploadedDate() { return uploadedDate; }
    public void setUploadedDate(LocalDate uploadedDate) { this.uploadedDate = uploadedDate; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getUploadId() { return uploadId; }
    public void setUploadId(String uploadId) { this.uploadId = uploadId; }
}
