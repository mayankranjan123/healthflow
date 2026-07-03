package com.healthflow.healthflow.controller;

import com.healthflow.healthflow.model.User;
import com.healthflow.healthflow.model.Role;
import com.healthflow.healthflow.repository.UserRepository;
import com.healthflow.healthflow.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User userRequest, @RequestParam String roleName) {
        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));

        userRequest.setRole(userRole);
        userRequest.setPasswordHash(passwordEncoder.encode("password123")); // default password

        userRepository.save(userRequest);
        return ResponseEntity.ok(userRequest);
    }
}
