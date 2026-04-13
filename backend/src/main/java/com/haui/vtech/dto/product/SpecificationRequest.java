package com.haui.vtech.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SpecificationRequest {
    private String screenSize;
    private String screenTech;
    private String resolution;
    private String operatingSystem;
    private String chip;
    private String cpu;
    private String gpu;
    private String ram;
    private String storageCapacity;
    private String batteryCapacity;
    private String chargingTech;
    private String backCamera;
    private String frontCamera;
    private String connectivity;
    private String specialFeature;
    private String weight;
    private LocalDate releaseDate;
}
