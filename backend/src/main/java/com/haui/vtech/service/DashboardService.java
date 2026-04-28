package com.haui.vtech.service;

import com.haui.vtech.dto.dashboard.KpiDataResponse;
import com.haui.vtech.dto.dashboard.OrderStatusChartResponse;
import com.haui.vtech.dto.dashboard.RevenueChartResponse;
import com.haui.vtech.dto.dashboard.TopProductResponse;

import java.util.List;

public interface DashboardService {

    List<KpiDataResponse> getKpiData(String period);

    List<OrderStatusChartResponse> getOrderStatusChart(String period);

    List<RevenueChartResponse> getRevenueChart(String period);

    List<TopProductResponse> getTopProducts(String metric);
}
