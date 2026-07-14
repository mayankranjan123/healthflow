package com.healthflow.report.controller;

import com.healthflow.security.AuthorizationHelper;

import com.healthflow.common.dto.ApiResponse;
import com.healthflow.report.dto.ReportResponseDto;
import com.healthflow.report.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    private final AuthorizationHelper authHelper;

    public ReportController(ReportService reportService, AuthorizationHelper authHelper) {
        this.reportService = reportService;
        this.authHelper = authHelper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ReportResponseDto>> getReport(
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @RequestParam(value = "quickFilter", defaultValue = "TODAY") String quickFilter,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate) {

        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        ReportResponseDto response = reportService.getReportData(clinicId, quickFilter, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Reports data retrieved successfully", response));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<com.healthflow.report.dto.DashboardResponseDto>> getDashboard(
            @RequestParam(value = "clinicId", defaultValue = "1000000000") Long clinicId,
            @RequestParam(value = "fromDate") String fromDate,
            @RequestParam(value = "toDate") String toDate) {

        if (!authHelper.isAuthorized(clinicId, "ADMIN", "DOCTOR", "STAFF")) { return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized access to clinic")); }
        com.healthflow.report.dto.DashboardResponseDto response = reportService.getDashboardData(clinicId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully", response));
    }
}
