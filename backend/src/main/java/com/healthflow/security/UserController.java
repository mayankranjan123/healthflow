package com.healthflow.security;

import com.healthflow.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/users")
public class UserController {

    private final JdbcTemplate jdbcTemplate;

    public UserController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal)) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        Long userId = principal.getId();

        // Fetch basic user details
        String sql = "SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.gender, u.date_of_birth, u.clinic_id, r.name as role_name " +
                     "FROM users u " +
                     "LEFT JOIN user_roles ur ON u.id = ur.user_id " +
                     "LEFT JOIN roles r ON ur.role_id = r.id " +
                     "WHERE u.id = ?";
        
        try {
            Map<String, Object> map = jdbcTemplate.queryForMap(sql, userId);
            String role = (String) map.get("role_name");
            
            java.util.Map<String, Object> profile = new java.util.HashMap<>();
            
            // Fetch associated clinic settings
            Long clinicId = ((Number) map.get("clinic_id")).longValue();
            try {
                String clinicSql = "SELECT name, phone, email, logo_url, website, gst_number, registration_number, " +
                                   "address_line, city, state, country, pincode, currency, language FROM clinics WHERE id = ?";
                Map<String, Object> clinicMap = jdbcTemplate.queryForMap(clinicSql, clinicId);
                Map<String, Object> clinic = new java.util.HashMap<>();
                clinic.put("name", clinicMap.get("name"));
                clinic.put("phone", clinicMap.get("phone") != null ? clinicMap.get("phone") : "");
                clinic.put("email", clinicMap.get("email") != null ? clinicMap.get("email") : "");
                clinic.put("logoUrl", clinicMap.get("logo_url") != null ? clinicMap.get("logo_url") : "");
                clinic.put("website", clinicMap.get("website") != null ? clinicMap.get("website") : "");
                clinic.put("gstNumber", clinicMap.get("gst_number") != null ? clinicMap.get("gst_number") : "");
                clinic.put("registrationNumber", clinicMap.get("registration_number") != null ? clinicMap.get("registration_number") : "");
                clinic.put("addressLine", clinicMap.get("address_line") != null ? clinicMap.get("address_line") : "");
                clinic.put("city", clinicMap.get("city") != null ? clinicMap.get("city") : "");
                clinic.put("state", clinicMap.get("state") != null ? clinicMap.get("state") : "");
                clinic.put("country", clinicMap.get("country") != null ? clinicMap.get("country") : "India");
                clinic.put("pincode", clinicMap.get("pincode") != null ? clinicMap.get("pincode") : "");
                clinic.put("currency", clinicMap.get("currency") != null ? clinicMap.get("currency") : "INR (₹)");
                clinic.put("language", clinicMap.get("language") != null ? clinicMap.get("language") : "English (India)");

                profile.put("clinic", clinic);
            } catch (Exception e) {
                profile.put("clinic", null);
            }
            profile.put("id", map.get("id").toString());
            profile.put("email", map.get("email"));
            profile.put("name", map.get("first_name") + " " + map.get("last_name"));
            profile.put("mobile", map.get("phone") != null ? map.get("phone") : "");
            profile.put("isActive", map.get("is_active"));
            profile.put("role", role != null ? role : "STAFF");
            profile.put("gender", map.get("gender") != null ? map.get("gender") : "");
            profile.put("dateOfBirth", map.get("date_of_birth") != null ? map.get("date_of_birth").toString() : "");
            profile.put("avatarUrl", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop");

            // If Doctor, fetch additional fields from doctors table
            if ("DOCTOR".equals(role)) {
                try {
                    String docSql = "SELECT specialization, license_number, followup_fees FROM doctors WHERE user_id = ?";
                    Map<String, Object> docMap = jdbcTemplate.queryForMap(docSql, userId);
                    profile.put("specialization", docMap.get("specialization"));
                    profile.put("registrationNumber", docMap.get("license_number"));
                    
                    java.math.BigDecimal followupFees = (java.math.BigDecimal) docMap.get("followup_fees");
                    profile.put("followupFee", followupFees != null ? followupFees.doubleValue() : 60.0);
                    
                    // Mock/Default fallbacks for fields not in db
                    profile.put("qualification", "MBBS, MD");
                    profile.put("experience", "10 Years");
                    profile.put("fee", 100.0);
                    profile.put("workingHours", "09:00 AM - 05:00 PM");
                    profile.put("joiningDate", "2024-01-01");
                } catch (Exception e) {
                    profile.put("specialization", "General Practitioner");
                    profile.put("registrationNumber", "LIC-" + userId);
                    profile.put("followupFee", 60.0);
                    profile.put("qualification", "MBBS, MD");
                    profile.put("experience", "10 Years");
                    profile.put("fee", 100.0);
                    profile.put("workingHours", "09:00 AM - 05:00 PM");
                    profile.put("joiningDate", "2024-01-01");
                }
            }
            
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(ApiResponse.error("Profile not found"));
        }
    }

    @GetMapping("/permissions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getModulePermissions() {
        String sql = "SELECT module, label, description, admin_access, doctor_access, staff_access FROM module_permissions ORDER BY id ASC";
        try {
            List<Map<String, Object>> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("module", rs.getString("module"));
                map.put("label", rs.getString("label"));
                map.put("description", rs.getString("description"));
                map.put("ADMIN", rs.getBoolean("admin_access"));
                map.put("DOCTOR", rs.getBoolean("doctor_access"));
                map.put("STAFF", rs.getBoolean("staff_access"));
                return map;
            });
            return ResponseEntity.ok(ApiResponse.success("Permissions retrieved successfully", list));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to retrieve permissions"));
        }
    }

    @PostMapping("/permissions")
    public ResponseEntity<ApiResponse<Void>> saveModulePermissions(@RequestBody List<Map<String, Object>> permissions) {
        if (permissions == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Permissions list cannot be null"));
        }
        try {
            for (Map<String, Object> perm : permissions) {
                String module = (String) perm.get("module");
                Boolean admin = (Boolean) perm.get("ADMIN");
                Boolean doctor = (Boolean) perm.get("DOCTOR");
                Boolean staff = (Boolean) perm.get("STAFF");
                String sql = "UPDATE module_permissions SET admin_access = ?, doctor_access = ?, staff_access = ? WHERE module = ?";
                jdbcTemplate.update(sql, admin != null && admin, doctor != null && doctor, staff != null && staff, module);
            }
            return ResponseEntity.ok(ApiResponse.success("Permissions updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to update permissions: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUsers() {
        String sql = "SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.gender, u.date_of_birth, r.name as role_name " +
                     "FROM users u " +
                     "LEFT JOIN user_roles ur ON u.id = ur.user_id " +
                     "LEFT JOIN roles r ON ur.role_id = r.id " +
                     "WHERE u.clinic_id = 1";
        
        List<Map<String, Object>> users = jdbcTemplate.query(sql, (rs, rowNum) -> {
            String role = rs.getString("role_name");
            String prefix = "STF-";
            if ("ADMIN".equals(role)) {
                prefix = "ADM-";
            } else if ("DOCTOR".equals(role)) {
                prefix = "DOC-";
            }
            
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", prefix + rs.getLong("id"));
            map.put("email", rs.getString("email"));
            map.put("name", rs.getString("first_name") + " " + rs.getString("last_name"));
            map.put("mobile", rs.getString("phone") != null ? rs.getString("phone") : "");
            map.put("isActive", rs.getBoolean("is_active"));
            map.put("role", role != null ? role : "STAFF");
            map.put("avatarUrl", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop");
            map.put("gender", rs.getString("gender") != null ? rs.getString("gender") : "");
            map.put("dateOfBirth", rs.getDate("date_of_birth") != null ? rs.getDate("date_of_birth").toString() : "");

            // If it is a doctor, let's fetch followup fees from doctors table
            if ("DOCTOR".equals(role)) {
                try {
                    String docSql = "SELECT followup_fees FROM doctors WHERE user_id = ?";
                    java.math.BigDecimal ff = jdbcTemplate.queryForObject(docSql, java.math.BigDecimal.class, rs.getLong("id"));
                    map.put("followupFee", ff != null ? ff.toString() : "");
                } catch (Exception e) {
                    map.put("followupFee", "");
                }
            }

            return map;
        });

        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createUser(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String name = (String) request.get("name");
        String mobile = (String) request.get("mobile");
        String role = (String) request.get("role");
        boolean isActive = request.get("isActive") == null || (Boolean) request.get("isActive");
        String gender = (String) request.get("gender");
        String dateOfBirth = (String) request.get("dateOfBirth");
        String followupFeeStr = (String) request.get("followupFee");
        String consultationFeeStr = (String) request.get("consultationFee");
        if (consultationFeeStr == null) {
            consultationFeeStr = (String) request.get("fee");
        }

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
        }
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Name is required"));
        }
        if (role == null || role.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Role is required"));
        }

        // Check if email already exists
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)", Integer.class, email.trim());
        if (count != null && count > 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is already in use"));
        }

        String[] parts = name.split(" ", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";

        java.sql.Date dobDate = null;
        if (dateOfBirth != null && !dateOfBirth.isBlank()) {
            try {
                dobDate = java.sql.Date.valueOf(dateOfBirth);
            } catch (Exception e) {}
        }

        // Insert user
        jdbcTemplate.update(
            "INSERT INTO users (clinic_id, email, password, first_name, last_name, phone, is_active, gender, date_of_birth) " +
            "VALUES (1, ?, '$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2', ?, ?, ?, ?, ?, ?)",
            email.trim(), firstName, lastName, mobile, isActive, gender, dobDate
        );

        Long userId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", Long.class, email.trim());

        // Assign role
        Long roleId = jdbcTemplate.queryForObject("SELECT id FROM roles WHERE name = ?", Long.class, role);
        jdbcTemplate.update("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", userId, roleId);

        java.math.BigDecimal followupFee = null;
        if (followupFeeStr != null && !followupFeeStr.isBlank()) {
            try {
                followupFee = new java.math.BigDecimal(followupFeeStr);
            } catch (Exception e) {}
        }

        java.math.BigDecimal consultationFee = null;
        if (consultationFeeStr != null && !consultationFeeStr.isBlank()) {
            try {
                consultationFee = new java.math.BigDecimal(consultationFeeStr);
            } catch (Exception e) {}
        }

        // If it's a DOCTOR, also seed doctors table for completeness!
        if ("DOCTOR".equals(role)) {
            String specialization = (String) request.get("specialization");
            String registrationNumber = (String) request.get("registrationNumber");
            jdbcTemplate.update(
                "INSERT INTO doctors (clinic_id, user_id, first_name, last_name, email, phone, specialization, license_number, followup_fees, consultation_fees, is_active) " +
                "VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                userId, firstName, lastName, email, mobile,
                specialization != null ? specialization : "General Practitioner",
                registrationNumber != null ? registrationNumber : ("LIC-" + userId),
                followupFee, consultationFee, isActive
            );
        }

        // Generate Onboarding Token
        String token = java.util.UUID.randomUUID().toString();
        java.sql.Timestamp expiry = new java.sql.Timestamp(System.currentTimeMillis() + 24 * 3600 * 1000); // 24 hours expiry
        jdbcTemplate.update(
            "INSERT INTO password_reset_tokens (user_id, token, expiry_date) VALUES (?, ?, ?)",
            userId, token, expiry
        );

        String setPasswordLink = "http://localhost:3000/set-password?token=" + token + "&email=" + email;
        
        // Print Onboarding simulation in standard output / system log
        System.out.println("\n");
        System.out.println("==========================================================================");
        System.out.println("MOCK EMAIL SENDER - USER ONBOARDING");
        System.out.println("To: " + email);
        System.out.println("Subject: Complete your HealthFlow Onboarding");
        System.out.println("Body: Welcome to HealthFlow! Please complete your registration and set your");
        System.out.println("password by clicking on the link below:");
        System.out.println("Link: " + setPasswordLink);
        System.out.println("==========================================================================");
        System.out.println("\n");

        String prefix = "ADMIN".equals(role) ? "ADM-" : ("DOCTOR".equals(role) ? "DOC-" : "STF-");
        java.util.Map<String, Object> created = new java.util.HashMap<>();
        created.put("id", prefix + userId);
        created.put("email", email);
        created.put("name", name);
        created.put("mobile", mobile);
        created.put("isActive", isActive);
        created.put("role", role);
        created.put("gender", gender != null ? gender : "");
        created.put("dateOfBirth", dateOfBirth != null ? dateOfBirth : "");
        created.put("setPasswordLink", setPasswordLink);
        if ("DOCTOR".equals(role)) {
            created.put("followupFee", followupFeeStr != null ? followupFeeStr : "");
            created.put("consultationFee", consultationFeeStr != null ? consultationFeeStr : "");
        }

        return ResponseEntity.ok(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUser(@PathVariable("id") String rawId, @RequestBody Map<String, Object> request) {
        Long id = Long.parseLong(rawId.replaceAll("[^0-9]", ""));
        String email = (String) request.get("email");
        String name = (String) request.get("name");
        String mobile = (String) request.get("mobile");
        boolean isActive = request.get("isActive") == null || (Boolean) request.get("isActive");
        String gender = (String) request.get("gender");
        String dateOfBirth = (String) request.get("dateOfBirth");
        String followupFeeStr = (String) request.get("followupFee");
        String consultationFeeStr = (String) request.get("consultationFee");
        if (consultationFeeStr == null) {
            consultationFeeStr = (String) request.get("fee");
        }

        String[] parts = name.split(" ", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";

        java.sql.Date dobDate = null;
        if (dateOfBirth != null && !dateOfBirth.isBlank()) {
            try {
                dobDate = java.sql.Date.valueOf(dateOfBirth);
            } catch (Exception e) {}
        }

        jdbcTemplate.update(
            "UPDATE users SET email = ?, first_name = ?, last_name = ?, phone = ?, is_active = ?, gender = ?, date_of_birth = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            email, firstName, lastName, mobile, isActive, gender, dobDate, id
        );

        java.math.BigDecimal followupFee = null;
        if (followupFeeStr != null && !followupFeeStr.isBlank()) {
            try {
                followupFee = new java.math.BigDecimal(followupFeeStr);
            } catch (Exception e) {}
        }

        java.math.BigDecimal consultationFee = null;
        if (consultationFeeStr != null && !consultationFeeStr.isBlank()) {
            try {
                consultationFee = new java.math.BigDecimal(consultationFeeStr);
            } catch (Exception e) {}
        }

        String specialization = (String) request.get("specialization");
        String registrationNumber = (String) request.get("registrationNumber");

        int updatedRows = jdbcTemplate.update(
            "UPDATE doctors SET email = ?, first_name = ?, last_name = ?, phone = ?, is_active = ?, followup_fees = ?, consultation_fees = ?, specialization = ?, license_number = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? OR email = ?",
            email, firstName, lastName, mobile, isActive, followupFee, consultationFee,
            specialization != null ? specialization : "General Practitioner",
            registrationNumber != null ? registrationNumber : ("LIC-" + id),
            id, email
        );

        if (updatedRows == 0) {
            // Check if user is a DOCTOR to insert
            String checkRoleSql = "SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?";
            try {
                String userRole = jdbcTemplate.queryForObject(checkRoleSql, String.class, id);
                if ("DOCTOR".equals(userRole)) {
                    jdbcTemplate.update(
                        "INSERT INTO doctors (clinic_id, user_id, first_name, last_name, email, phone, specialization, license_number, followup_fees, consultation_fees, is_active) " +
                        "VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        id, firstName, lastName, email, mobile,
                        specialization != null ? specialization : "General Practitioner",
                        registrationNumber != null ? registrationNumber : ("LIC-" + id),
                        followupFee, consultationFee, isActive
                    );
                }
            } catch (Exception e) {}
        }

        return ResponseEntity.ok(ApiResponse.success("User updated successfully", Map.of("id", rawId)));
    }
}
