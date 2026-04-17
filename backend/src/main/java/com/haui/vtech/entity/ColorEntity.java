package com.haui.vtech.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "colors")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class ColorEntity extends BaseEntity{
    @Column(name = "color_name", nullable = false, length = 100)
    private String colorName;

    @Column(name = "hex_code", length = 20)
    private String hexCode;

    @OneToMany(mappedBy = "color", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<ProductVariantEntity> productVariants = new HashSet<>();
}
