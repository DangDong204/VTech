//package com.haui.vtech.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.SuperBuilder;
//import java.math.BigDecimal;
//
//@Entity
//@Table(name = "order_details")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//public class OrderDetailEntity extends BaseEntity {
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "order_id", nullable = false)
//    private OrderEntity order;
//
//    // Giả sử bạn đã có bảng ProductVariant
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "variant_id", nullable = false)
//    private ProductVariantEntity variant;
//
//    @Column(name = "quantity", nullable = false)
//    private Integer quantity;
//
//    @Column(name = "price", nullable = false)
//    private BigDecimal price;
//
//    @Column(name = "total_price", nullable = false)
//    private BigDecimal totalPrice;
//}