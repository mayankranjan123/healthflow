package com.healthflow.report.controller;

import com.healthflow.common.dto.ApiResponse;
import com.healthflow.report.dto.ReportResponseDto;
import com.healthflow.report.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ReportResponseDto>> getReport(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @RequestParam(value = "quickFilter", defaultValue = "TODAY") String quickFilter,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate) {

        ReportResponseDto response = reportService.getReportData(clinicId, quickFilter, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Reports data retrieved successfully", response));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<com.healthflow.report.dto.DashboardResponseDto>> getDashboard(
            @RequestParam(value = "clinicId", defaultValue = "1") Long clinicId,
            @RequestParam(value = "fromDate") String fromDate,
            @RequestParam(value = "toDate") String toDate) {

        com.healthflow.report.dto.DashboardResponseDto response = reportService.getDashboardData(clinicId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully", response));
    }
}
