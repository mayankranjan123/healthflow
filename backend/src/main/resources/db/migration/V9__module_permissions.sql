-- Create module_permissions table to store live custom UI access mappings

CREATE TABLE module_permissions (
    id SERIAL PRIMARY KEY,
    module VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    admin_access BOOLEAN NOT NULL DEFAULT TRUE,
    doctor_access BOOLEAN NOT NULL DEFAULT TRUE,
    staff_access BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO module_permissions (module, label, description, admin_access, doctor_access, staff_access) VALUES
('patients', 'Patients Management', 'Manage patient records and medical history', TRUE, TRUE, TRUE),
('appointments', 'Appointments Management', 'Schedule, cancel, and modify visits', TRUE, TRUE, TRUE),
('doctors', 'Doctor Management', 'Manage medical staff profiles and rosters', TRUE, FALSE, FALSE),
('billing', 'Billing', 'Process payments, invoices, and claims', TRUE, FALSE, TRUE),
('reports', 'Report', 'Generate analytics and export clinic data', TRUE, FALSE, FALSE),
('settings', 'Settings', 'Configure system-wide clinical parameters', TRUE, FALSE, FALSE);
