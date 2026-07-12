package com.healthflow.report.service;

import com.healthflow.report.dto.ReportResponseDto;

public interface ReportService {
    ReportResponseDto getReportData(Long clinicId, String quickFilter, String fromDate, String toDate);
    com.healthflow.report.dto.DashboardResponseDto getDashboardData(Long clinicId, String fromDate, String toDate);
}
