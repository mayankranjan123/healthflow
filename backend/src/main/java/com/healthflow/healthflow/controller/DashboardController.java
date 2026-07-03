package com.healthflow.healthflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAppointments", 150); // Mock data for now
        summary.put("totalRevenue", 45000);
        summary.put("pendingAmount", 12000);
        summary.put("totalPatients", 320);

        return ResponseEntity.ok(summary);
    }
}
