package com.haui.vtech.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class RevenueChartResponse {
    private String label;     // Mốc thời gian (VD: 0h, T2, T1)
    private double thisYear;  // Doanh thu kỳ này
    private double lastYear;  // Doanh thu kỳ trước
}