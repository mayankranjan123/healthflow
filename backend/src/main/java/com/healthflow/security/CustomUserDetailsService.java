package com.healthflow.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Supporting standard user accounts seeded in the database
        if ("admin@healthflow.com".equalsIgnoreCase(username) || "1".equals(username)) {
            return new UserPrincipal(
                    1L,
                    "admin@healthflow.com",
                    "$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2", // BCrypt of 'AdminPass123!'
                    "ADMIN",
                    true
            );
        } else if ("doctor@healthflow.com".equalsIgnoreCase(username) || "2".equals(username)) {
            return new UserPrincipal(
                    2L,
                    "doctor@healthflow.com",
                    "$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2", // BCrypt of 'AdminPass123!'
                    "DOCTOR",
                    true
            );
        } else if ("staff@healthflow.com".equalsIgnoreCase(username) || "3".equals(username)) {
            return new UserPrincipal(
                    3L,
                    "staff@healthflow.com",
                    "$2a$10$IECeaBY.MVk4eD9tr5Y57OkDL0lbOqPwz4lpxUT0dmzsGYNAo0Yq2", // BCrypt of 'AdminPass123!'
                    "STAFF",
                    true
            );
        }
        throw new UsernameNotFoundException("User not found with value: " + username);
    }
}
