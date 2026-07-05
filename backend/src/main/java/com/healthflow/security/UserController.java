package com.healthflow.security;

import com.healthflow.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final JdbcTemplate jdbcTemplate;

    public UserController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUsers() {
        String sql = "SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, r.name as role_name " +
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
            
            return Map.of(
                "id", prefix + rs.getLong("id"),
                "email", rs.getString("email"),
                "name", rs.getString("first_name") + " " + rs.getString("last_name"),
                "mobile", rs.getString("phone") != null ? rs.getString("phone") : "",
                "isActive", rs.getBoolean("is_active"),
                "role", role != null ? role : "STAFF",
                "avatarUrl", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop"
            );
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

        String[] parts = name.split(" ", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";

        // Insert user
        jdbcTemplate.update(
            "INSERT INTO users (clinic_id, email, password, first_name, last_name, phone, is_active) " +
            "VALUES (1, ?, '$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2', ?, ?, ?, ?)",
            email, firstName, lastName, mobile, isActive
        );

        Long userId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Long.class, email);

        // Assign role
        Long roleId = jdbcTemplate.queryForObject("SELECT id FROM roles WHERE name = ?", Long.class, role);
        jdbcTemplate.update("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", userId, roleId);

        // If it's a DOCTOR, also seed doctors table for completeness!
        if ("DOCTOR".equals(role)) {
            jdbcTemplate.update(
                "INSERT INTO doctors (clinic_id, user_id, first_name, last_name, email, phone, specialization, license_number) " +
                "VALUES (1, ?, ?, ?, ?, ?, 'General Practitioner', ?)",
                userId, firstName, lastName, email, mobile, "LIC-" + userId
            );
        }

        String prefix = "ADMIN".equals(role) ? "ADM-" : ("DOCTOR".equals(role) ? "DOC-" : "STF-");
        Map<String, Object> created = Map.of(
            "id", prefix + userId,
            "email", email,
            "name", name,
            "mobile", mobile,
            "isActive", isActive,
            "role", role
        );

        return ResponseEntity.ok(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUser(@PathVariable("id") String rawId, @RequestBody Map<String, Object> request) {
        Long id = Long.parseLong(rawId.replaceAll("[^0-9]", ""));
        String email = (String) request.get("email");
        String name = (String) request.get("name");
        String mobile = (String) request.get("mobile");
        boolean isActive = request.get("isActive") == null || (Boolean) request.get("isActive");

        String[] parts = name.split(" ", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "";

        jdbcTemplate.update(
            "UPDATE users SET email = ?, first_name = ?, last_name = ?, phone = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            email, firstName, lastName, mobile, isActive, id
        );

        jdbcTemplate.update(
            "UPDATE doctors SET email = ?, first_name = ?, last_name = ?, phone = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? OR email = ?",
            email, firstName, lastName, mobile, isActive, id, email
        );

        return ResponseEntity.ok(ApiResponse.success("User updated successfully", Map.of("id", rawId)));
    }
}
