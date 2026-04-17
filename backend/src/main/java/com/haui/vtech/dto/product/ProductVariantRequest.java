package com.haui.vtech.dto.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductVariantRequest {

    @NotBlank(message = "PRODUCT_ID_NOTBLANK")
    private String productId;

    @NotBlank(message = "COLOR_ID_NOTBLANK")
    private String colorId;

    @NotBlank(message = "VERSION_ID_NOTBLANK")
    private String versionId;

    @NotBlank(message = "VARIANT_SKU_NOTBLANK")
    private String sku;

    @NotNull(message = "BASE_PRICE_NOTNULL")
    @Min(value = 0, message = "BASE_PRICE_MIN")
    private BigDecimal basePrice;

    private BigDecimal salePrice;

    private Integer stockQuantity;
    private String status;
}
