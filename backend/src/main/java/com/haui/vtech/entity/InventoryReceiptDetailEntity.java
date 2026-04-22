package com.haui.vtech.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_receipt_details")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class InventoryReceiptDetailEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id", nullable = false)
    private InventoryReceiptEntity receipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariantEntity variant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "import_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal importPrice;

    @Column(name = "total_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPrice;

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        if (quantity != null && importPrice != null) {
            this.totalPrice = importPrice.multiply(BigDecimal.valueOf(quantity));
        } else {
            this.totalPrice = BigDecimal.ZERO;
        }
    }
}