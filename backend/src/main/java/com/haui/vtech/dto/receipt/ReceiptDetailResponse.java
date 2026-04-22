package com.haui.vtech.dto.receipt;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class ReceiptDetailResponse {
    private String id;
    private String variantId;
    private String sku;
    private String productName;
    private String versionName;
    private String colorName;
    private Integer quantity;
    private BigDecimal importPrice;
    private BigDecimal totalPrice;
}
