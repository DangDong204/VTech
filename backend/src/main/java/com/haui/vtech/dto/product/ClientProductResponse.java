package com.haui.vtech.dto.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class ClientProductResponse {
    private String id;
    private String baseName;
    private String slug;
    private BigDecimal rating;
    private Integer reviews;
    private String thumbnail;
    private List<ClientVariantResponse> variants;
}
