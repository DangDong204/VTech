package com.haui.vtech.entity;

import com.haui.vtech.enums.OrderStatus;
import com.haui.vtech.enums.PaymentMethod;
import com.haui.vtech.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity extends BaseEntity {

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "customer_address", nullable = false, length = 500)
    private String customerAddress;

    @Column(name = "sub_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal subTotal;

    @Column(name = "shipping_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal shippingFee;

    @Column(name = "product_discount", precision = 15, scale = 2)
    private BigDecimal productDiscount;

    @Column(name = "shipping_discount", precision = 15, scale = 2)
    private BigDecimal shippingDiscount;

    @Column(name = "final_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal finalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 50)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 50)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", length = 50)
    private OrderStatus orderStatus;

    @Column(name = "note", length = 500)
    private String note;

    @Builder.Default // THÊM DÒNG NÀY
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetailEntity> orderDetails = new ArrayList<>();

    @Builder.Default // THÊM DÒNG NÀY
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderHistoryEntity> orderHistories = new ArrayList<>();

    // Map bảng trung gian order_vouchers
    @Builder.Default // THÊM DÒNG NÀY
    @ElementCollection
    @CollectionTable(name = "order_vouchers", joinColumns = @JoinColumn(name = "order_id"))
    @Column(name = "voucher_id")
    private List<String> voucherIds = new ArrayList<>();

    @PrePersist
    public void prePersistOrder() {
        super.prePersist();
        if (orderCode == null) {
            orderCode = "VT" + System.currentTimeMillis(); // Generate mã đơn tự động
        }
        if (paymentStatus == null) paymentStatus = PaymentStatus.PENDING;
        if (orderStatus == null) orderStatus = OrderStatus.PENDING;
        if (productDiscount == null) productDiscount = BigDecimal.ZERO;
        if (shippingDiscount == null) shippingDiscount = BigDecimal.ZERO;
    }
}