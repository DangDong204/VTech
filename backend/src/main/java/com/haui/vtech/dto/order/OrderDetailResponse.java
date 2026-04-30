package com.haui.vtech.dto.order;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderDetailResponse {
    private String id;
    private String variantId;

    // Thêm các trường hiển thị UI
    private String productName;
    private String variantName;
    private String colorName;
    private String imageUrl;

    private Integer quantity;
    private BigDecimal price;
    private BigDecimal totalPrice;

    private boolean reviewed;
}