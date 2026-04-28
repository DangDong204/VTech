package com.haui.vtech.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KpiDataResponse {
    private String label;
    private String value;
    private double change; // Phần trăm thay đổi
    private String prefix;
    private String suffix;
}