package com.haui.vtech.entity;

import com.haui.vtech.enums.PromotionStatus;
import com.haui.vtech.enums.PromotionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class PromotionEntity extends BaseEntity{

    @Column(name = "promotion_name", nullable = false, length = 255)
    private String promotionName;

    @Column(name = "promotion_desc", columnDefinition = "TEXT")
    private String promotionDesc;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private PromotionType discountType;

    @Column(name = "discount_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PromotionStatus status;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Ánh xạ N-N trực tiếp qua bảng promotion_variants (Lưu danh sách ID của Variant)
    @ElementCollection
    @CollectionTable(
            name = "promotion_variants",
            joinColumns = @JoinColumn(name = "promotion_id")
    )
    @Column(name = "variant_id")
    private Set<String> variantIds = new HashSet<>();

    @PrePersist
    public void prePersist() {
        super.prePersist();
        if (status == null) {
            status = PromotionStatus.ACTIVE;
        }
    }
}
