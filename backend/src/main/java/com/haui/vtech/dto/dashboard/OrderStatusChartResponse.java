package com.haui.vtech.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderStatusChartResponse {
    private String name;
    private long value;
}