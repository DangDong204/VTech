package com.haui.vtech.dto.product;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class SpecificationResponse {
    private String productId;
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
//    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate releaseDate;
}
