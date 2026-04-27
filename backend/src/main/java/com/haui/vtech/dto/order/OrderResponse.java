package com.haui.vtech.dto.order;

import com.haui.vtech.enums.OrderStatus;
import com.haui.vtech.enums.PaymentMethod;
import com.haui.vtech.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private String id;
    private String orderCode;
    private String customerName;
    private String customerPhone;
    private String customerAddress;

    private BigDecimal subTotal;
    private BigDecimal shippingFee;
    private BigDecimal productDiscount;
    private BigDecimal shippingDiscount;
    private BigDecimal finalPrice;

    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;
    private String note;

    private LocalDateTime createdAt;

    private List<OrderDetailResponse> orderDetails;
    private List<OrderHistoryResponse> orderHistories;
}