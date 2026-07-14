package com.healthflow.clinic.controller;

import com.healthflow.security.AuthorizationHelper;

import com.healthflow.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/clinics")
public class ClinicController {

    private final JdbcTemplate jdbcTemplate;
    private final AuthorizationHelper authHelper;

    public ClinicController(JdbcTemplate jdbcTemplate, AuthorizationHelper authHelper) {
        this.jdbcTemplate = jdbcTemplate;
        this.authHelper = authHelper;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getClinicSettings(@PathVariable("id") Long id) {
        if (!authHelper.isAuthorized(id, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        String sql = "SELECT name, phone, email, logo_url, website, gst_number, registration_number, " +
                     "address_line, city, state, country, pincode, currency, language FROM clinics WHERE id = ?";
        try {
            Map<String, Object> map = jdbcTemplate.queryForMap(sql, id);
            Map<String, Object> clinic = new HashMap<>();
            clinic.put("name", map.get("name"));
            clinic.put("phone", map.get("phone") != null ? map.get("phone") : "");
            clinic.put("email", map.get("email") != null ? map.get("email") : "");
            clinic.put("logoUrl", map.get("logo_url") != null ? map.get("logo_url") : "");
            clinic.put("website", map.get("website") != null ? map.get("website") : "");
            clinic.put("gstNumber", map.get("gst_number") != null ? map.get("gst_number") : "");
            clinic.put("registrationNumber", map.get("registration_number") != null ? map.get("registration_number") : "");
            clinic.put("addressLine", map.get("address_line") != null ? map.get("address_line") : "");
            clinic.put("city", map.get("city") != null ? map.get("city") : "");
            clinic.put("state", map.get("state") != null ? map.get("state") : "");
            clinic.put("country", map.get("country") != null ? map.get("country") : "India");
            clinic.put("pincode", map.get("pincode") != null ? map.get("pincode") : "");
            clinic.put("currency", map.get("currency") != null ? map.get("currency") : "INR (₹)");
            clinic.put("language", map.get("language") != null ? map.get("language") : "English (India)");

            return ResponseEntity.ok(ApiResponse.success("Clinic settings retrieved successfully", clinic));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Clinic settings not found"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateClinicSettings(@PathVariable("id") Long id, @RequestBody Map<String, Object> request) {
        if (!authHelper.isAuthorized(id, "ADMIN")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        String sql = "UPDATE clinics SET name = ?, phone = ?, email = ?, logo_url = ?, website = ?, gst_number = ?, " +
                     "registration_number = ?, address_line = ?, city = ?, state = ?, country = ?, pincode = ?, " +
                     "currency = ?, language = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        try {
            jdbcTemplate.update(sql,
                request.get("name"),
                request.get("phone"),
                request.get("email"),
                request.get("logoUrl"),
                request.get("website"),
                request.get("gstNumber"),
                request.get("registrationNumber"),
                request.get("addressLine"),
                request.get("city"),
                request.get("state"),
                request.get("country"),
                request.get("pincode"),
                request.get("currency"),
                request.get("language"),
                id
            );
            return ResponseEntity.ok(ApiResponse.success("Clinic settings updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update clinic settings: " + e.getMessage()));
        }
    }    @GetMapping("/{id}/billing")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBillingSettings(@PathVariable("id") Long id) {
        if (!authHelper.isAuthorized(id, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        String sql = "SELECT invoice_prefix, starting_invoice_number, auto_generate_invoice_number, " +
                     "default_tax_percent, tax_label, enable_item_level_tax, enable_invoice_level_discount, " +
                     "selected_template_id, show_clinic_logo, show_clinic_address, show_clinic_contact, " +
                     "show_doctor_name, show_patient_mobile, show_payment_summary, " +
                     "show_footer_message, show_authorized_signature, footer_message FROM billing_settings WHERE clinic_id = ?";
        try {
            Map<String, Object> map = jdbcTemplate.queryForMap(sql, id);
            Map<String, Object> billing = new HashMap<>();
            billing.put("invoicePrefix", map.get("invoice_prefix"));
            billing.put("startingInvoiceNumber", map.get("starting_invoice_number"));
            billing.put("autoGenerateInvoiceNumber", map.get("auto_generate_invoice_number"));
            billing.put("defaultTaxPercent", map.get("default_tax_percent"));
            billing.put("taxLabel", map.get("tax_label"));
            billing.put("enableItemLevelTax", map.get("enable_item_level_tax"));
            billing.put("enableInvoiceLevelDiscount", map.get("enable_invoice_level_discount"));
            billing.put("selectedTemplateId", map.get("selected_template_id"));
            billing.put("showClinicLogo", map.get("show_clinic_logo"));
            billing.put("showClinicAddress", map.get("show_clinic_address"));
            billing.put("showClinicContact", map.get("show_clinic_contact"));
            billing.put("showDoctorName", map.get("show_doctor_name"));
            billing.put("showPatientMobile", map.get("show_patient_mobile"));
            billing.put("showPaymentSummary", map.get("show_payment_summary"));
            billing.put("showFooterMessage", map.get("show_footer_message"));
            billing.put("showAuthorizedSignature", map.get("show_authorized_signature"));
            billing.put("footerMessage", map.get("footer_message"));

            return ResponseEntity.ok(ApiResponse.success("Billing settings retrieved successfully", billing));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Billing settings not found"));
        }
    }

    @PutMapping("/{id}/billing")
    public ResponseEntity<ApiResponse<Void>> updateBillingSettings(@PathVariable("id") Long id, @RequestBody Map<String, Object> request) {
        if (!authHelper.isAuthorized(id, "ADMIN")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        String sql = "UPDATE billing_settings SET invoice_prefix = ?, starting_invoice_number = ?, " +
                     "auto_generate_invoice_number = ?, default_tax_percent = ?, tax_label = ?, enable_item_level_tax = ?, " +
                     "enable_invoice_level_discount = ?, selected_template_id = ?, show_clinic_logo = ?, show_clinic_address = ?, " +
                     "show_clinic_contact = ?, show_doctor_name = ?, show_patient_mobile = ?, " +
                     "show_payment_summary = ?, show_footer_message = ?, " +
                     "show_authorized_signature = ?, footer_message = ?, updated_at = CURRENT_TIMESTAMP WHERE clinic_id = ?";
        try {
            jdbcTemplate.update(sql,
                request.get("invoicePrefix"),
                request.get("startingInvoiceNumber"),
                request.get("autoGenerateInvoiceNumber"),
                request.get("defaultTaxPercent"),
                request.get("taxLabel"),
                request.get("enableItemLevelTax"),
                request.get("enableInvoiceLevelDiscount"),
                request.get("selectedTemplateId"),
                request.get("showClinicLogo"),
                request.get("showClinicAddress"),
                request.get("showClinicContact"),
                request.get("showDoctorName"),
                request.get("showPatientMobile"),
                request.get("showPaymentSummary"),
                request.get("showFooterMessage"),
                request.get("showAuthorizedSignature"),
                request.get("footerMessage"),
                id
            );
            return ResponseEntity.ok(ApiResponse.success("Billing settings updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update billing settings: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/prescription")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPrescriptionSettings(@PathVariable("id") Long id) {
        if (!authHelper.isAuthorized(id, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        String sql = "SELECT prefix, starting_number, auto_generate_number, header_layout, show_clinic_logo, " +
                     "show_doctor_qualifications, show_doctor_department, show_vitals, show_patient_history, " +
                     "show_diagnosis, show_duration, show_dosage_instructions, default_footer_note FROM prescription_settings WHERE clinic_id = ?";
        try {
            Map<String, Object> map = jdbcTemplate.queryForMap(sql, id);
            Map<String, Object> prsc = new HashMap<>();
            prsc.put("prefix", map.get("prefix"));
            prsc.put("startingNumber", map.get("starting_number"));
            prsc.put("autoGenerateNumber", map.get("auto_generate_number"));
            prsc.put("headerLayout", map.get("header_layout"));
            prsc.put("showClinicLogo", map.get("show_clinic_logo"));
            prsc.put("showDoctorQualifications", map.get("show_doctor_qualifications"));
            prsc.put("showDoctorDepartment", map.get("show_doctor_department"));
            prsc.put("showVitals", map.get("show_vitals"));
            prsc.put("showPatientHistory", map.get("show_patient_history"));
            prsc.put("showDiagnosis", map.get("show_diagnosis"));
            prsc.put("showDuration", map.get("show_duration"));
            prsc.put("showDosageInstructions", map.get("show_dosage_instructions"));
            prsc.put("defaultFooterNote", map.get("default_footer_note"));

            return ResponseEntity.ok(ApiResponse.success("Prescription settings retrieved successfully", prsc));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Prescription settings not found"));
        }
    }

    @PutMapping("/{id}/prescription")
    public ResponseEntity<ApiResponse<Void>> updatePrescriptionSettings(@PathVariable("id") Long id, @RequestBody Map<String, Object> request) {
        if (!authHelper.isAuthorized(id, "ADMIN")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        String sql = "UPDATE prescription_settings SET prefix = ?, starting_number = ?, auto_generate_number = ?, " +
                     "header_layout = ?, show_clinic_logo = ?, show_doctor_qualifications = ?, show_doctor_department = ?, " +
                     "show_vitals = ?, show_patient_history = ?, show_diagnosis = ?, show_duration = ?, " +
                     "show_dosage_instructions = ?, default_footer_note = ?, updated_at = CURRENT_TIMESTAMP WHERE clinic_id = ?";
        try {
            jdbcTemplate.update(sql,
                request.get("prefix"),
                request.get("startingNumber"),
                request.get("autoGenerateNumber"),
                request.get("headerLayout"),
                request.get("showClinicLogo"),
                request.get("showDoctorQualifications"),
                request.get("showDoctorDepartment"),
                request.get("showVitals"),
                request.get("showPatientHistory"),
                request.get("showDiagnosis"),
                request.get("showDuration"),
                request.get("showDosageInstructions"),
                request.get("defaultFooterNote"),
                id
            );
            return ResponseEntity.ok(ApiResponse.success("Prescription settings updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update prescription settings: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createClinic(@RequestBody Map<String, Object> request) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized to create clinic")); }
        String name = (String) request.get("name");
        String code = (String) request.get("code");
        String phone = (String) request.get("phone");
        String email = (String) request.get("email");
        String address = (String) request.get("address");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Clinic name is required"));
        }
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Clinic code is required"));
        }

        // Generate a unique 10-digit ID (starts with a digit from 1-9)
        Long clinicId = generateUnique10DigitId();

        // 1. Insert into clinics
        String insertClinicSql = "INSERT INTO clinics (id, name, code, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)";
        // 2. Insert into billing_settings
        String insertBillingSql = "INSERT INTO billing_settings (clinic_id) VALUES (?)";
        // 3. Insert into prescription_settings
        String insertPrescriptionSql = "INSERT INTO prescription_settings (clinic_id) VALUES (?)";
        // 4. Insert into clinic_settings
        String insertClinicSettingsSql = "INSERT INTO clinic_settings (clinic_id, setting_key, setting_value) VALUES (?, ?, ?)";

        try {
            // Check if code already exists
            String checkCodeSql = "SELECT COUNT(*) FROM clinics WHERE code = ?";
            Integer count = jdbcTemplate.queryForObject(checkCodeSql, Integer.class, code);
            if (count != null && count > 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Clinic code already exists: " + code));
            }

            jdbcTemplate.update(insertClinicSql, clinicId, name, code, phone, email, address);
            jdbcTemplate.update(insertBillingSql, clinicId);
            jdbcTemplate.update(insertPrescriptionSql, clinicId);
            
            // Seed clinic settings
            jdbcTemplate.update(insertClinicSettingsSql, clinicId, "operating_hours", 
                "{\"monday_to_friday\": \"08:00 AM - 05:00 PM\", \"saturday\": \"09:00 AM - 01:00 PM\", \"sunday\": \"Closed\"}");
            jdbcTemplate.update(insertClinicSettingsSql, clinicId, "alert_threshold_inventory", "15");
            jdbcTemplate.update(insertClinicSettingsSql, clinicId, "enable_auto_sms_reminders", "true");

            Map<String, Object> response = new HashMap<>();
            response.put("id", clinicId);
            response.put("name", name);
            response.put("code", code);
            response.put("phone", phone != null ? phone : "");
            response.put("email", email != null ? email : "");
            response.put("address", address != null ? address : "");

            return ResponseEntity.status(201).body(ApiResponse.success("Clinic created successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to create clinic: " + e.getMessage()));
        }
    }

    private Long generateUnique10DigitId() {
        java.util.Random random = new java.util.Random();
        while (true) {
            // Generate a 10-digit number (1000000000 to 9999999999)
            long val = 1000000000L + (Math.abs(random.nextLong()) % 9000000000L);
            // Verify uniqueness in database
            String checkIdSql = "SELECT COUNT(*) FROM clinics WHERE id = ?";
            Integer count = jdbcTemplate.queryForObject(checkIdSql, Integer.class, val);
            if (count == null || count == 0) {
                return val;
            }
        }
    }
}
