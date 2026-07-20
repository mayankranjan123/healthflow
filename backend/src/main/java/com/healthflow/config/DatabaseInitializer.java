package com.healthflow.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

@Component
public class DatabaseInitializer {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void initialize() {
        // 1. Create tables if not exist
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS clinics (" +
                "id BIGINT PRIMARY KEY, " +
                "name VARCHAR(150) NOT NULL, " +
                "code VARCHAR(50) NOT NULL UNIQUE, " +
                "phone VARCHAR(50), " +
                "email VARCHAR(150), " +
                "address VARCHAR(255), " +
                "is_active BOOLEAN NOT NULL DEFAULT TRUE, " +
                "created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP" +
                ")");

        jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_clinics_code ON clinics(code)");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS permissions (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "name VARCHAR(100) NOT NULL UNIQUE, " +
                "description VARCHAR(255), " +
                "created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP" +
                ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS roles (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "name VARCHAR(50) NOT NULL UNIQUE, " +
                "description VARCHAR(255), " +
                "created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP" +
                ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS role_permissions (" +
                "role_id BIGINT NOT NULL, " +
                "permission_id BIGINT NOT NULL, " +
                "PRIMARY KEY (role_id, permission_id), " +
                "CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE, " +
                "CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE" +
                ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS users (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "clinic_id BIGINT NOT NULL DEFAULT 1000000000, " +
                "email VARCHAR(150) NOT NULL UNIQUE, " +
                "password VARCHAR(100) NOT NULL, " +
                "first_name VARCHAR(100) NOT NULL, " +
                "last_name VARCHAR(100) NOT NULL, " +
                "phone VARCHAR(50), " +
                "avatar_url VARCHAR(255), " +
                "is_active BOOLEAN NOT NULL DEFAULT TRUE, " +
                "created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "CONSTRAINT fk_users_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT" +
                ")");

        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_users_clinic ON users(clinic_id)");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS user_roles (" +
                "user_id BIGINT NOT NULL, " +
                "role_id BIGINT NOT NULL, " +
                "PRIMARY KEY (user_id, role_id), " +
                "CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, " +
                "CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT" +
                ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS password_reset_tokens (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "token VARCHAR(255) NOT NULL UNIQUE, " +
                "user_id BIGINT NOT NULL, " +
                "expiry_date TIMESTAMP WITH TIME ZONE NOT NULL, " +
                "CONSTRAINT fk_pwd_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE" +
                ")");

        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_pwd_tokens_value ON password_reset_tokens(token)");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS clinic_settings (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "clinic_id BIGINT NOT NULL DEFAULT 1000000000, " +
                "setting_key VARCHAR(100) NOT NULL, " +
                "setting_value TEXT NOT NULL, " +
                "created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "CONSTRAINT fk_settings_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT, " +
                "CONSTRAINT uq_clinic_setting_key UNIQUE (clinic_id, setting_key)" +
                ")");

        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_clinic_settings_parent ON clinic_settings(clinic_id)");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS billing_settings (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "clinic_id BIGINT NOT NULL DEFAULT 1000000000, " +
                "tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00, " +
                "currency VARCHAR(10) NOT NULL DEFAULT 'USD', " +
                "invoice_prefix VARCHAR(20) NOT NULL DEFAULT 'INV', " +
                "created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "CONSTRAINT fk_billing_settings_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT, " +
                "CONSTRAINT uq_clinic_billing_settings UNIQUE (clinic_id)" +
                ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS audit_logs (" +
                "id BIGSERIAL PRIMARY KEY, " +
                "clinic_id BIGINT NOT NULL DEFAULT 1000000000, " +
                "user_id BIGINT, " +
                "action VARCHAR(100) NOT NULL, " +
                "entity_name VARCHAR(100) NOT NULL, " +
                "entity_id BIGINT, " +
                "payload TEXT, " +
                "ip_address VARCHAR(45), " +
                "created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "CONSTRAINT fk_audit_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT, " +
                "CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL" +
                ")");

        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic ON audit_logs(clinic_id)");
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)");
        jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)");

        // 2. Seed default clinic
        Integer clinicCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM clinics WHERE id = 1000000000", Integer.class);
        if (clinicCount == 0) {
            jdbcTemplate.execute("INSERT INTO clinics (id, name, code, phone, email, address) " +
                    "VALUES (1000000000, 'HealthFlow Downtown Clinic', 'HF-DOWNTOWN', '+1-555-0199', 'contact@healthflow.com', '123 Medical Plaza, Suite 400')");
        }

        // 3. Seed permissions
        Integer permCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM permissions", Integer.class);
        if (permCount == 0) {
            jdbcTemplate.execute("INSERT INTO permissions (name, description) VALUES " +
                    "('READ_PATIENT', 'Ability to view patient records'), " +
                    "('WRITE_PATIENT', 'Ability to create and update patient records'), " +
                    "('DELETE_PATIENT', 'Ability to soft-delete patient records'), " +
                    "('READ_CLINICAL', 'Ability to view medical charts and prescriptions'), " +
                    "('WRITE_CLINICAL', 'Ability to add diagnostics, notes, and prescriptions'), " +
                    "('WRITE_BILLING', 'Ability to manage invoices, payments, and billing configurations'), " +
                    "('READ_REPORTS', 'Ability to view financial and operational analytics dashboards'), " +
                    "('MANAGE_USERS', 'Ability to create and manage system user accounts'), " +
                    "('MANAGE_SETTINGS', 'Ability to modify clinic settings and variables')");
        }

        // 4. Seed roles
        Integer roleCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM roles", Integer.class);
        if (roleCount == 0) {
            jdbcTemplate.execute("INSERT INTO roles (name, description) VALUES " +
                    "('ADMIN', 'Clinic Administrator with full clinical, financial, and operational access'), " +
                    "('DOCTOR', 'Medical Doctor with charting, prescribing, and schedule access'), " +
                    "('STAFF', 'Front desk and administrative staff with patient registration, billing, and scheduling access')");
        }

        // 5. Seed role_permissions mappings
        Integer mappingCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_permissions", Integer.class);
        if (mappingCount == 0) {
            // Map Admin Permissions (All)
            jdbcTemplate.execute("INSERT INTO role_permissions (role_id, permission_id) " +
                    "SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN'");

            // Map Doctor Permissions
            jdbcTemplate.execute("INSERT INTO role_permissions (role_id, permission_id) " +
                    "SELECT r.id, p.id FROM roles r, permissions p " +
                    "WHERE r.name = 'DOCTOR' AND p.name IN ('READ_PATIENT', 'WRITE_PATIENT', 'READ_CLINICAL', 'WRITE_CLINICAL', 'READ_REPORTS')");

            // Map Staff Permissions
            jdbcTemplate.execute("INSERT INTO role_permissions (role_id, permission_id) " +
                    "SELECT r.id, p.id FROM roles r, permissions p " +
                    "WHERE r.name = 'STAFF' AND p.name IN ('READ_PATIENT', 'WRITE_PATIENT', 'WRITE_BILLING', 'READ_REPORTS')");
        }

        // 6. Seed essential default users (System admin / Default doctor / Default staff)
        Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        if (userCount == 0) {
            // admin@healthflow.com (AdminPass123!)
            jdbcTemplate.execute("INSERT INTO users (id, clinic_id, email, password, first_name, last_name, phone) " +
                    "VALUES (1, 1000000000, 'admin@healthflow.com', '$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2', 'System', 'Administrator', '+1-555-0100')");
            jdbcTemplate.execute("INSERT INTO user_roles (user_id, role_id) " +
                    "SELECT 1, id FROM roles WHERE name = 'ADMIN'");

            // doctor@healthflow.com (DoctorPass123!)
            jdbcTemplate.execute("INSERT INTO users (id, clinic_id, email, password, first_name, last_name, phone) " +
                    "VALUES (2, 1000000000, 'doctor@healthflow.com', '$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2', 'Sarah', 'Mitchell', '+1-555-0101')");
            jdbcTemplate.execute("INSERT INTO user_roles (user_id, role_id) " +
                    "SELECT 2, id FROM roles WHERE name = 'DOCTOR'");

            // staff@healthflow.com (StaffPass123!)
            jdbcTemplate.execute("INSERT INTO users (id, clinic_id, email, password, first_name, last_name, phone) " +
                    "VALUES (3, 1000000000, 'staff@healthflow.com', '$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2', 'Alex', 'Rivera', '+1-555-0102')");
            jdbcTemplate.execute("INSERT INTO user_roles (user_id, role_id) " +
                    "SELECT 3, id FROM roles WHERE name = 'STAFF'");
        }

        // 7. Seed default doctor details to support matching custom user details
        Integer doctorDetailCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM doctors", Integer.class);
        if (doctorDetailCount == 0) {
            jdbcTemplate.execute("INSERT INTO doctors (id, clinic_id, user_id, first_name, last_name, email, phone, specialization, license_number, consultation_fees, is_active, created_at, updated_at) " +
                    "VALUES (1, 1000000000, 2, 'Sarah', 'Mitchell', 'doctor@healthflow.com', '+1-555-0101', 'General Practitioner', 'LIC-GP-94021', 150.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
        }

        // 8. Seed default billing settings
        Integer billingSettingCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM billing_settings", Integer.class);
        if (billingSettingCount == 0) {
            jdbcTemplate.execute("INSERT INTO billing_settings (id, clinic_id, tax_rate, currency, invoice_prefix) " +
                    "VALUES (1, 1000000000, 7.50, 'USD', 'INV')");
        }
    }
}
