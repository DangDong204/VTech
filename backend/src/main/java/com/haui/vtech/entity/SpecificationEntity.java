package com.haui.vtech.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Table(name = "specifications")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class SpecificationEntity extends BaseEntity{

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private ProductEntity product;

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

    @Column(columnDefinition = "TEXT")
    private String specialFeature;

    private String weight;
    private LocalDate releaseDate;
}
