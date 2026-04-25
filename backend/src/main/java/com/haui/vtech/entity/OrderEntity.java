//package com.haui.vtech.entity;
//
//import com.haui.vtech.enums.OrderStatus;
//import com.haui.vtech.enums.PaymentMethod;
//import com.haui.vtech.enums.PaymentStatus;
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.SuperBuilder;
//
//import java.math.BigDecimal;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Set;
//import java.util.HashSet;
//
//@Entity
//@Table(name = "orders")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//public class OrderEntity extends BaseEntity {
//
//    @Column(name = "order_code", nullable = false, unique = true)
//    private String orderCode;
//
//    @Column(name = "user_id", nullable = false)
//    private String userId;
//
//    // Thông tin giao hàng
//    @Column(name = "customer_name", nullable = false)
//    private String customerName;
//
//    @Column(name = "customer_phone", nullable = false)
//    private String customerPhone;
//
//    @Column(name = "customer_address", nullable = false)
//    private String customerAddress;
//
//    // Giá cả
//    @Column(name = "sub_total")
//    private BigDecimal subTotal;
//
//    @Column(name = "shipping_fee")
//    private BigDecimal shippingFee;
//
//    @Column(name = "product_discount")
//    private BigDecimal productDiscount;
//
//    @Column(name = "shipping_discount")
//    private BigDecimal shippingDiscount;
//
//    @Column(name = "final_price")
//    private BigDecimal finalPrice;
//
//    // Status
//    @Enumerated(EnumType.STRING)
//    @Column(name = "payment_method")
//    private PaymentMethod paymentMethod;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "payment_status")
//    private PaymentStatus paymentStatus;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "order_status")
//    private OrderStatus orderStatus;
//
//    @Column(name = "note")
//    private String note;
//
//    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<OrderDetailEntity> orderDetails = new ArrayList<>();
//
//    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<OrderHistoryEntity> orderHistories = new ArrayList<>();
//
//    @ManyToMany
//    @JoinTable(
//            name = "order_vouchers",
//            joinColumns = @JoinColumn(name = "order_id"),
//            inverseJoinColumns = @JoinColumn(name = "voucher_id")
//    )
//    private Set<VoucherEntity> vouchers = new HashSet<>();
//}