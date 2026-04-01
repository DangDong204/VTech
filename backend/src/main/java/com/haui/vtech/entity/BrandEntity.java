package com.haui.vtech.entity;

import com.haui.vtech.enums.BrandStatus;
import com.haui.vtech.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "brands")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class BrandEntity extends BaseEntity {

    @Column(name = "brand_name", nullable = false, length = 50)
    private String brandName;

    @Column(name = "slug", nullable = false, length = 50, unique = true)
    private String slug;

    @Column(name = "brand_desc", length = 255)
    private String brandDesc;

    @Column(name = "brand_logo", length = 255)
    private String brandLogo;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BrandStatus status;

    @PrePersist
    public void prePersist() {
        super.prePersist();
        if (status == null) {
            status = BrandStatus.ACTIVE;
        }
    }
    // TODO: relationship with product
}
