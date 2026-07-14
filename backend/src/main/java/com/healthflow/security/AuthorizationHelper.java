package com.healthflow.security;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthorizationHelper {

    private final JdbcTemplate jdbcTemplate;

    public AuthorizationHelper(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean isAuthorized(Long clinicId, String... allowedRoles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserPrincipal)) {
            return false;
        }

        UserPrincipal userPrincipal = (UserPrincipal) principal;

        // Check if the user's clinicId matches the requested clinicId
        if (userPrincipal.getClinicId() == null || !userPrincipal.getClinicId().equals(clinicId)) {
            return false;
        }

        // If specific roles are required, verify the user has one of them
        if (allowedRoles != null && allowedRoles.length > 0) {
            String role = userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
            boolean roleAllowed = false;
            for (String allowedRole : allowedRoles) {
                if (allowedRole.equalsIgnoreCase(role)) {
                    roleAllowed = true;
                    break;
                }
            }
            if (!roleAllowed) {
                return false;
            }
        }

        return true;
    }

    public boolean isPatientClinicAuthorized(Long patientId, String... allowedRoles) {
        try {
            Long clinicId = jdbcTemplate.queryForObject(
                "SELECT clinic_id FROM patients WHERE id = ?", Long.class, patientId);
            return isAuthorized(clinicId, allowedRoles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAppointmentClinicAuthorized(Long appointmentId, String... allowedRoles) {
        try {
            Long clinicId = jdbcTemplate.queryForObject(
                "SELECT clinic_id FROM appointments WHERE id = ?", Long.class, appointmentId);
            return isAuthorized(clinicId, allowedRoles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isPrescriptionClinicAuthorized(Long prescriptionId, String... allowedRoles) {
        try {
            Long clinicId = jdbcTemplate.queryForObject(
                "SELECT clinic_id FROM prescriptions WHERE id = ?", Long.class, prescriptionId);
            return isAuthorized(clinicId, allowedRoles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isInvoiceClinicAuthorized(Long invoiceId, String... allowedRoles) {
        try {
            Long clinicId = jdbcTemplate.queryForObject(
                "SELECT clinic_id FROM invoices WHERE id = ?", Long.class, invoiceId);
            return isAuthorized(clinicId, allowedRoles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isDoctorClinicAuthorized(Long doctorId, String... allowedRoles) {
        try {
            Long clinicId = jdbcTemplate.queryForObject(
                "SELECT clinic_id FROM doctors WHERE id = ?", Long.class, doctorId);
            return isAuthorized(clinicId, allowedRoles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isUserClinicAuthorized(Long userId, String... allowedRoles) {
        try {
            Long clinicId = jdbcTemplate.queryForObject(
                "SELECT clinic_id FROM users WHERE id = ?", Long.class, userId);
            return isAuthorized(clinicId, allowedRoles);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isPatientFileClinicAuthorized(Long fileId, String... allowedRoles) {
        try {
            Long clinicId = jdbcTemplate.queryForObject(
                "SELECT p.clinic_id FROM patient_files f JOIN patients p ON f.patient_id = p.id WHERE f.id = ?", Long.class, fileId);
            return isAuthorized(clinicId, allowedRoles);
        } catch (Exception e) {
            return false;
        }
    }
}
