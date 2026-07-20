package com.healthflow.security;

import com.healthflow.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final JdbcTemplate jdbcTemplate;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider, JdbcTemplate jdbcTemplate) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Map<String, Object> data = new HashMap<>();
        data.put("token", jwt);
        data.put("id", principal.getId().toString());
        data.put("email", principal.getUsername());
        
        // Map roles back to the human-readable names expected by frontend
        String role = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .findFirst()
                .orElse("STAFF");
        data.put("role", role);
        
        String name = principal.getUsername();
        String avatarUrl = "";
        try {
            Map<String, Object> userMap = jdbcTemplate.queryForMap("SELECT first_name, last_name, avatar_url FROM users WHERE id = ?", principal.getId());
            String firstName = (String) userMap.get("first_name");
            String lastName = (String) userMap.get("last_name");
            String fullName = (firstName != null ? firstName : "") + (lastName != null ? " " + lastName : "");
            if (!fullName.trim().isEmpty()) {
                name = fullName.trim();
            }
            if (userMap.get("avatar_url") != null) {
                avatarUrl = (String) userMap.get("avatar_url");
            }
        } catch (Exception e) {}
        data.put("name", name);
        data.put("avatarUrl", avatarUrl);

        return ResponseEntity.ok(ApiResponse.success("Login successful", data));
    }

    @PostMapping("/set-password")
    public ResponseEntity<ApiResponse<String>> setPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String token = request.get("token");
        String password = request.get("password");

        if (email == null || token == null || password == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Missing required parameters"));
        }

        // Validate token in database
        String sql = "SELECT COUNT(*) FROM password_reset_tokens t " +
                     "JOIN users u ON t.user_id = u.id " +
                     "WHERE LOWER(u.email) = LOWER(?) AND t.token = ? AND t.expiry_date > CURRENT_TIMESTAMP";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email.trim(), token.trim());
        if (count == null || count == 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired onboarding token"));
        }

        // Hash password
        String hashedPassword = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(password, org.springframework.security.crypto.bcrypt.BCrypt.gensalt());

        // Update user password
        jdbcTemplate.update("UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)", hashedPassword, email.trim());

        // Delete token to prevent reuse
        jdbcTemplate.update("DELETE FROM password_reset_tokens WHERE token = ?", token.trim());

        return ResponseEntity.ok(ApiResponse.success("Password configured successfully. You can now log in.", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (email == null || currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Missing required parameters"));
        }

        // Fetch user password hash
        String selectSql = "SELECT password FROM users WHERE LOWER(email) = LOWER(?)";
        String currentHash;
        try {
            currentHash = jdbcTemplate.queryForObject(selectSql, String.class, email.trim());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User not found"));
        }

        // Verify current password match
        if (!org.springframework.security.crypto.bcrypt.BCrypt.checkpw(currentPassword, currentHash)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Current password is incorrect"));
        }

        // Hash new password
        String newHash = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(newPassword, org.springframework.security.crypto.bcrypt.BCrypt.gensalt());

        // Update password
        jdbcTemplate.update("UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)", newHash, email.trim());

        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("OK");
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
