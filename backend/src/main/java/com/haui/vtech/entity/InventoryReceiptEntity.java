package com.haui.vtech.entity;


import com.haui.vtech.enums.ReceiptStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventory_receipts")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class InventoryReceiptEntity extends BaseEntity{

    @Column(name = "receipt_code", nullable = false, unique = true, length = 50)
    private String receiptCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private SupplierEntity supplier;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ReceiptStatus status;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryReceiptDetailEntity> details = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        super.prePersist();
        if (status == null) status = ReceiptStatus.PENDING;
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
    }
}
