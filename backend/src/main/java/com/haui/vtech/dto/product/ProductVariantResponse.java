package com.haui.vtech.dto.product;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductVariantResponse {
    private String id;
    private String productId;
    private String productName; // Lấy thêm tên SP cho FE tiện hiển thị
    private String colorId;
    private String colorName; // Lấy thêm tên màu cho FE tiện hiển thị
    private String hexCode; // Lấy thêm mã màu cho FE tiện hiển thị
    private String versionId;
    private String versionName; // Lấy thêm tên phiên bản cho FE tiện hiển thị
    private String sku;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private Integer stockQuantity;
    private String status;
}
