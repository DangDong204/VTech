package com.haui.vtech.dto.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class ClientVariantResponse {
    private String id;
    private String version;
    private String color;
    private String colorHex;
    private BigDecimal price;         // Giá bán thực tế (Sale Price hoặc Base Price)
    private BigDecimal originalPrice; // Giá gốc (Base Price)
}
