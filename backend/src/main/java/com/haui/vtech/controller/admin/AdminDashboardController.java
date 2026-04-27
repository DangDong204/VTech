package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.dashboard.KpiDataResponse;
import com.haui.vtech.dto.dashboard.OrderStatusChartResponse;
import com.haui.vtech.dto.dashboard.RevenueChartResponse;
import com.haui.vtech.dto.dashboard.TopProductResponse;
import com.haui.vtech.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpi")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<KpiDataResponse>> getKpis(@RequestParam(defaultValue = "month") String period) {
        return ApiResponse.<List<KpiDataResponse>>builder()
                .data(dashboardService.getKpiData(period))
                .build();
    }

    @GetMapping("/order-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<OrderStatusChartResponse>> getOrderStatusChart(@RequestParam(defaultValue = "month") String period) {
        return ApiResponse.<List<OrderStatusChartResponse>>builder()
                .data(dashboardService.getOrderStatusChart(period))
                .build();
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<RevenueChartResponse>> getRevenueChart(@RequestParam(defaultValue = "month") String period) {
        return ApiResponse.<List<RevenueChartResponse>>builder()
                .data(dashboardService.getRevenueChart(period))
                .build();
    }

    @GetMapping("/top-products")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<List<TopProductResponse>> getTopProducts(@RequestParam(defaultValue = "revenue") String metric) {
        return ApiResponse.<List<TopProductResponse>>builder()
                .data(dashboardService.getTopProducts(metric))
                .build();
    }
}