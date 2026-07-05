package com.healthflow.security;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final JdbcTemplate jdbcTemplate;

    public CustomUserDetailsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Query database users table joining role name
        String sql = "SELECT u.id, u.email, u.password, u.is_active, r.name as role_name " +
                     "FROM users u " +
                     "LEFT JOIN user_roles ur ON u.id = ur.user_id " +
                     "LEFT JOIN roles r ON ur.role_id = r.id " +
                     "WHERE u.email = ? OR CAST(u.id AS varchar) = ?";
                     
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql, username, username);
        if (list.isEmpty()) {
            throw new UsernameNotFoundException("User not found with value: " + username);
        }

        Map<String, Object> userMap = list.get(0);
        
        // Extract boolean properties safely
        Object activeObj = userMap.get("is_active");
        boolean isActive = activeObj == null || (Boolean) activeObj;

        String role = (String) userMap.get("role_name");
        if (role == null) {
            role = "STAFF";
        }

        return new UserPrincipal(
                ((Number) userMap.get("id")).longValue(),
                (String) userMap.get("email"),
                (String) userMap.get("password"),
                role,
                isActive
        );
    }
}
