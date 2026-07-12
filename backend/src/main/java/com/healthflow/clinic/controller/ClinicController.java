package com.healthflow.clinic.controller;

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

    public ClinicController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getClinicSettings(@PathVariable("id") Long id) {
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
}
