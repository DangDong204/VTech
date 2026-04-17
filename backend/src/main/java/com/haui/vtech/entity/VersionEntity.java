package com.haui.vtech.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "versions")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class VersionEntity extends BaseEntity{
    @Column(name = "version_name", nullable = false, length = 100)
    private String versionName;

    @OneToMany(mappedBy = "version", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<ProductVariantEntity> productVariants = new HashSet<>();
}
