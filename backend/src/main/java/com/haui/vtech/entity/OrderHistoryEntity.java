//package com.haui.vtech.entity;
//
//import com.haui.vtech.enums.OrderStatus;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//import lombok.Setter;
//import lombok.experimental.SuperBuilder;
//
//@Entity
//@Table(name = "order_history")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//public class OrderHistoryEntity extends BaseEntity {
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "order_id", nullable = false)
//    private OrderEntity order;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "old_status", length = 50)
//    private OrderStatus oldStatus;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "new_status", length = 50, nullable = false)
//    private OrderStatus newStatus;
//
//    @Column(name = "note")
//    private String note;
//
//    @Column(name = "created_by", length = 36)
//    private String createdBy;
//}