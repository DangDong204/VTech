package com.haui.vtech.dto.cart;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private String id; // ID của cart_detail
    private String productSlug;
    private String variantId;

    private String productName;
    private String versionName;
    private String colorName;
    private String colorHex;

    private String imageUrl;

    private BigDecimal price; // Giá bán hiện tại (sale_price)
    private BigDecimal originalPrice; // THÊM MỚI: Giá gốc để hiển thị gạch ngang

    private Integer quantity; // Số lượng khách chọn mua
    private Integer stockQuantity; // THÊM MỚI: Số lượng còn lại trong kho

    private BigDecimal totalPrice;
}
