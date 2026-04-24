package com.haui.vtech.dto.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class ClientVariantDetailResponse {
    private String id;
    private String version;
    private String color;
    private BigDecimal price;
    private BigDecimal originalPrice;
}