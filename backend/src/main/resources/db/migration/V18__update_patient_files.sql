-- Recreate patient_files table to align with JPA PatientFile entity
DROP TABLE IF EXISTS patient_files CASCADE;

CREATE TABLE patient_files (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(255),
    size VARCHAR(255),
    file_type VARCHAR(255),
    CONSTRAINT fk_files_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE INDEX idx_files_patient ON patient_files(patient_id);
