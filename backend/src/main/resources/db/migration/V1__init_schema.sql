-- HealthFlow Complete Production-Ready PostgreSQL Schema (Flyway V1 Migration)
-- Consolidated for CockroachDB performance and compatibility

-- 1. Table: clinics (The top-level scoping entity)
CREATE TABLE clinics (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(50),
    email VARCHAR(150),
    address VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_clinics_code ON clinics(code);

-- Seed Initial Default Clinic
INSERT INTO clinics (id, name, code, phone, email, address)
VALUES (1, 'HealthFlow Downtown Clinic', 'HF-DOWNTOWN', '+1-555-0199', 'contact@healthflow.com', '123 Medical Plaza, Suite 400');

-- 2. Table: permissions (Granular privilege flags)
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed System Permissions
INSERT INTO permissions (name, description) VALUES
('READ_PATIENT', 'Ability to view patient records'),
('WRITE_PATIENT', 'Ability to create and update patient records'),
('DELETE_PATIENT', 'Ability to soft-delete patient records'),
('READ_CLINICAL', 'Ability to view medical charts and prescriptions'),
('WRITE_CLINICAL', 'Ability to add diagnostics, notes, and prescriptions'),
('WRITE_BILLING', 'Ability to manage invoices, payments, and billing configurations'),
('READ_REPORTS', 'Ability to view financial and operational analytics dashboards'),
('MANAGE_USERS', 'Ability to create and manage system user accounts'),
('MANAGE_SETTINGS', 'Ability to modify clinic settings and variables');

-- 3. Table: roles (User profiles mapping to authorizations)
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Essential Clinic Roles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Clinic Administrator with full clinical, financial, and operational access'),
('DOCTOR', 'Medical Doctor with charting, prescribing, and schedule access'),
('STAFF', 'Front desk and administrative staff with patient registration, billing, and scheduling access');

-- 4. Table: role_permissions (Many-to-Many Role Auth Mapping)
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Map Admin Permissions (All)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN';

-- Map Doctor Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'DOCTOR' AND p.name IN ('READ_PATIENT', 'WRITE_PATIENT', 'READ_CLINICAL', 'WRITE_CLINICAL', 'READ_REPORTS');

-- Map Staff Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'STAFF' AND p.name IN ('READ_PATIENT', 'WRITE_PATIENT', 'WRITE_BILLING', 'READ_REPORTS');

-- 5. Table: users (Internal staff and clinicians)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clinic ON users(clinic_id);

-- 6. Table: user_roles (Many-to-Many User to Role Binding)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- Seed Initial Super Admin User (admin@healthflow.com / AdminPass123!)
INSERT INTO users (id, clinic_id, email, password, first_name, last_name, phone)
VALUES (1, 1, 'admin@healthflow.com', '$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2', 'System', 'Administrator', '+1-555-0100');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'admin@healthflow.com' AND r.name = 'ADMIN';

-- 7. Table: password_reset_tokens
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_pwd_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_pwd_tokens_value ON password_reset_tokens(token);

-- 8. Table: doctors (Specialized details for physicians)
CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    user_id BIGINT UNIQUE, -- Nullable if doctor is a contractor without an app user account
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctors_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_doctors_clinic ON doctors(clinic_id);
CREATE INDEX idx_doctors_name ON doctors(last_name, first_name);
CREATE INDEX idx_doctors_email ON doctors(email);

-- Seed Default Doctor User & Detail (doctor@healthflow.com / DoctorPass123!)
INSERT INTO users (id, clinic_id, email, password, first_name, last_name, phone)
VALUES (2, 1, 'doctor@healthflow.com', '$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2', 'Sarah', 'Mitchell', '+1-555-0101');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'doctor@healthflow.com' AND r.name = 'DOCTOR';

INSERT INTO doctors (id, clinic_id, user_id, first_name, last_name, email, phone, specialization, license_number)
SELECT 1, 1, u.id, 'Sarah', 'Mitchell', 'doctor@healthflow.com', '+1-555-0101', 'General Practitioner', 'LIC-GP-94021'
FROM users u WHERE u.email = 'doctor@healthflow.com';

-- Seed Default Staff User (staff@healthflow.com / StaffPass123!)
INSERT INTO users (id, clinic_id, email, password, first_name, last_name, phone)
VALUES (3, 1, 'staff@healthflow.com', '$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2', 'Alex', 'Rivera', '+1-555-0102');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'staff@healthflow.com' AND r.name = 'STAFF';

-- 9. Table: patients (Clinical Demographics)
CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    patient_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    address VARCHAR(255),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    allergies TEXT,
    existing_diseases TEXT,
    clinical_notes TEXT,
    profile_image_url VARCHAR(255),
    purpose VARCHAR(255),
    blood_group VARCHAR(10),
    last_visit TIMESTAMP WITH TIME ZONE,
    next_visit TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE, -- Soft delete support
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patients_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT uq_clinic_patient_code UNIQUE (clinic_id, patient_code)
);

CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_search_name ON patients(full_name);
CREATE INDEX idx_patients_search_phone ON patients(mobile);
CREATE INDEX idx_patients_soft_delete ON patients(is_deleted);

-- Seed Sample Patient Records
INSERT INTO patients (id, clinic_id, patient_code, full_name, date_of_birth, gender, mobile, email, address, emergency_contact_name, emergency_contact_phone, allergies, existing_diseases, clinical_notes) VALUES
(1, 1, 'PID-94021', 'James Dalton', '1984-06-12', 'MALE', '+1-555-4432', 'j.dalton@gmail.com', '458 Birch St, Apt B', 'Emily Dalton', '+1-555-4433', 'Penicillin', 'Hypertension', 'Patient has a history of high blood pressure. Monitors at home.'),
(2, 1, 'PID-94025', 'Elena Larsson', '1992-11-23', 'FEMALE', '+1-555-8912', 'elena.larsson@outlook.com', '789 Oak Ave', 'Sven Larsson', '+1-555-8910', 'None', 'None', 'Annual physical examinations only.'),
(3, 1, 'PID-93988', 'Robert Moore', '1971-03-05', 'MALE', '+1-555-2231', 'rmoore71@yahoo.com', '12 Pine Dr', 'Linda Moore', '+1-555-2232', 'Peanuts', 'Type-2 Diabetes', 'On Metformin regimen. Blood sugar is well controlled.'),
(4, 1, 'PID-94030', 'Sofia Cheng', '1995-08-19', 'FEMALE', '+1-555-7761', 'sofia.cheng@gmail.com', '88 Maple Lane', 'Ken Cheng', '+1-555-7760', 'Shellfish', 'Asthma', 'Uses Albuterol inhaler as needed for seasonal symptoms.');

-- 10. Table: patient_files (Metadata for clinical files, PDFs, Scans)
CREATE TABLE patient_files (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    patient_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL, -- in bytes
    gcs_file_path VARCHAR(255) NOT NULL,
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_files_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT fk_files_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_files_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_files_patient ON patient_files(patient_id);
CREATE INDEX idx_files_clinic ON patient_files(clinic_id);

-- 11. Table: appointments (Scheduling transactions)
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    appointment_code VARCHAR(50) NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, CANCELLED, COMPLETED, NO_SHOW
    appointment_reason VARCHAR(255) NOT NULL,
    cancellation_reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointments_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    CONSTRAINT chk_appointment_status CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW')),
    CONSTRAINT uq_clinic_appointment_code UNIQUE (clinic_id, appointment_code)
);

CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date_time);
CREATE INDEX idx_appointments_code ON appointments(appointment_code);

-- Seed Dynamic Mock Appointments
INSERT INTO appointments (id, clinic_id, appointment_code, patient_id, doctor_id, appointment_date_time, status, appointment_reason, notes) VALUES
(1, 1, 'APT-10001', 1, 1, '2026-07-02 09:30:00+00', 'COMPLETED', 'Follow-up: Hypertension check', 'BP was high. Advised lifestyle changes.'),
(2, 1, 'APT-10002', 2, 1, '2026-07-03 10:15:00+00', 'SCHEDULED', 'Annual Wellness Exam', 'Check-up package selected.'),
(3, 1, 'APT-10003', 3, 1, '2026-07-03 11:00:00+00', 'SCHEDULED', 'Acute Sinusitis (Urgent)', 'Has severe cold symptoms for 4 days.'),
(4, 1, 'APT-10004', 4, 1, '2026-07-03 11:45:00+00', 'SCHEDULED', 'Lab Result Review', 'Discuss metabolic panel.');

-- 12. Table: medical_records (Diagnostic medical log / chart notes)
CREATE TABLE medical_records (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    symptoms TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_records_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT fk_records_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_records_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT
);

CREATE INDEX idx_records_clinic ON medical_records(clinic_id);
CREATE INDEX idx_records_patient_id ON medical_records(patient_id);

-- Seed Medical Record for first patient
INSERT INTO medical_records (id, clinic_id, patient_id, doctor_id, visit_date, symptoms, diagnosis, treatment_plan, notes) VALUES
(1, 1, 1, 1, '2026-07-02 09:30:00+00', 'Mild headaches, pressure in chest during workout.', 'Primary Hypertension', 'Increase Lissinopril to 10mg. Reduce salt intake. Return in 4 weeks.', 'Patient agrees to lifestyle changes.');

-- 13. Table: prescriptions (E-prescriptions linked to visits)
CREATE TABLE prescriptions (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    prescription_code VARCHAR(50) NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_id BIGINT,
    prescription_date DATE NOT NULL,
    clinical_notes TEXT NOT NULL,
    pdf_url VARCHAR(255),
    diagnosis VARCHAR(255) NOT NULL,
    symptoms VARCHAR(255) NOT NULL,
    tests_recommended TEXT,
    advice TEXT,
    next_visit_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prescriptions_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT fk_prescriptions_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_prescriptions_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    CONSTRAINT fk_prescriptions_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    CONSTRAINT uq_clinic_prescription_code UNIQUE (clinic_id, prescription_code)
);

CREATE INDEX idx_prescriptions_clinic ON prescriptions(clinic_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_code ON prescriptions(prescription_code);
CREATE INDEX idx_prescriptions_date ON prescriptions(prescription_date);

-- Seed Prescription Linked to James Dalton
INSERT INTO prescriptions (id, clinic_id, prescription_code, patient_id, doctor_id, appointment_id, prescription_date, clinical_notes, pdf_url, diagnosis, symptoms, status) VALUES
(1, 1, 'RX-10001', 1, 1, 1, '2026-07-02', 'Lisinopril regimen adjustment.', 'prescriptions/rx-dalton-20260702.pdf', 'Primary Hypertension', 'Mild headaches, pressure in chest', 'SAVED');

-- 14. Table: prescription_medicines (Individual drugs on prescription)
CREATE TABLE prescription_medicines (
    id BIGSERIAL PRIMARY KEY,
    prescription_id BIGINT NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    instructions TEXT,
    sequence_no INT4,
    CONSTRAINT fk_pm_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

CREATE INDEX idx_pm_parent ON prescription_medicines(prescription_id);

-- Seed drug details on prescription
INSERT INTO prescription_medicines (id, prescription_id, medicine_name, dosage, frequency, duration, instructions, sequence_no) VALUES
(1, 1, 'Lisinopril 10mg', '1 Tablet', 'Once Daily (Morning)', '30 Days', 'Take with or without food. Avoid potassium supplements.', 1);

-- 15. Table: invoices (Financial accounts receivables)
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    invoice_number VARCHAR(100) NOT NULL,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    invoice_date DATE NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    tax_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    pending_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Paid, Pending, Partial, Void
    payment_mode VARCHAR(50),
    reference_no VARCHAR(100),
    pdf_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoices_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoices_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    CONSTRAINT uq_clinic_invoice_number UNIQUE (clinic_id, invoice_number)
);

CREATE INDEX idx_invoices_clinic ON invoices(clinic_id);
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_doctor ON invoices(doctor_id);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);

-- Seed Invoices for Patient James Dalton
INSERT INTO invoices (id, clinic_id, invoice_number, patient_id, doctor_id, invoice_date, grand_total, tax_total, discount_total, subtotal, paid_amount, pending_amount, status, payment_mode, reference_no, pdf_url) VALUES
(1, 1, 'INV-2026-0001', 1, 1, '2026-07-02', 150.00, 10.00, 0.00, 140.00, 150.00, 0.00, 'Paid', 'CARD', 'TXN-90248231', 'billing/inv-2026-0001.pdf');

-- 16. Table: invoice_items (Individual line items in an invoice)
CREATE TABLE invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    quantity INT4 NOT NULL DEFAULT 1,
    total DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_invoice_items_parent FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoice_items_parent ON invoice_items(invoice_id);

INSERT INTO invoice_items (id, invoice_id, item_name, rate, quantity, total, discount_percent, tax_percent) VALUES
(1, 1, 'Consultation - General Practitioner Follow-up', 140.00, 1, 140.00, 0.00, 0.00);

-- 17. Table: payments (Cashier transactions)
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    invoice_id BIGINT NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- CASH, CARD, INSURANCE, BANK_TRANSFER
    transaction_reference VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('CASH', 'CARD', 'INSURANCE', 'BANK_TRANSFER'))
);

CREATE INDEX idx_payments_clinic ON payments(clinic_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);

INSERT INTO payments (id, clinic_id, invoice_id, amount, payment_method, transaction_reference, notes) VALUES
(1, 1, 1, 150.00, 'CARD', 'TXN-90248231', 'Full payment for doctor visit.');

-- 18. Table: clinic_settings (Custom properties for general clinic)
CREATE TABLE clinic_settings (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_settings_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT uq_clinic_setting_key UNIQUE (clinic_id, setting_key)
);

CREATE INDEX idx_clinic_settings_parent ON clinic_settings(clinic_id);

INSERT INTO clinic_settings (id, clinic_id, setting_key, setting_value) VALUES
(1, 1, 'operating_hours', '{"monday_to_friday": "08:00 AM - 05:00 PM", "saturday": "09:00 AM - 01:00 PM", "sunday": "Closed"}'),
(2, 1, 'alert_threshold_inventory', '15'),
(3, 1, 'enable_auto_sms_reminders', 'true');

-- 19. Table: billing_settings (Default rates & invoicing variables)
CREATE TABLE billing_settings (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- e.g. 5.00 for 5%
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    invoice_prefix VARCHAR(20) NOT NULL DEFAULT 'INV',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_billing_settings_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT uq_clinic_billing_settings UNIQUE (clinic_id)
);

INSERT INTO billing_settings (id, clinic_id, tax_rate, currency, invoice_prefix) VALUES
(1, 1, 7.50, 'USD', 'INV');

-- 20. Table: audit_logs (System-wide tracking & activity history)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    clinic_id BIGINT NOT NULL DEFAULT 1,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL, -- e.g., 'CREATE_PATIENT', 'UPDATE_INVOICE'
    entity_name VARCHAR(100) NOT NULL, -- e.g., 'patients', 'invoices'
    entity_id BIGINT,
    payload TEXT, -- JSON serialization of modifications
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_clinic ON audit_logs(clinic_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

INSERT INTO audit_logs (id, clinic_id, user_id, action, entity_name, entity_id, payload, ip_address) VALUES
(1, 1, 1, 'SEED_DATABASE', 'clinics', 1, '{"message": "Database successfully seeded with default configuration."}', '127.0.0.1');
