package com.healthflow.healthflow.controller;

import com.healthflow.healthflow.model.Role;
import com.healthflow.healthflow.model.User;
import com.healthflow.healthflow.repository.RoleRepository;
import com.healthflow.healthflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/setup")
public class SetupController {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @GetMapping("/init")
    public ResponseEntity<?> initSetup() {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            roleRepository.save(adminRole);

            Role doctorRole = new Role();
            doctorRole.setName("ROLE_DOCTOR");
            roleRepository.save(doctorRole);

            Role staffRole = new Role();
            staffRole.setName("ROLE_STAFF");
            roleRepository.save(staffRole);

            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@healthflow.com");
            admin.setPasswordHash(encoder.encode("password123"));
            admin.setRole(adminRole);
            userRepository.save(admin);

            User doctor = new User();
            doctor.setName("Dr. Smith");
            doctor.setEmail("doctor@healthflow.com");
            doctor.setPasswordHash(encoder.encode("password123"));
            doctor.setRole(doctorRole);
            userRepository.save(doctor);

            User staff = new User();
            staff.setName("Staff Member");
            staff.setEmail("staff@healthflow.com");
            staff.setPasswordHash(encoder.encode("password123"));
            staff.setRole(staffRole);
            userRepository.save(staff);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Roles and default users initialized");
            return ResponseEntity.ok(response);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Already initialized");
        return ResponseEntity.ok(response);
    }
}
