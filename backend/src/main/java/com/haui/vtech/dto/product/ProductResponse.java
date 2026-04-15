package com.haui.vtech.dto.product;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.vtech.enums.ProductStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {

    String id;
    String productName;
    String slug;
    String productDesc;

    Integer warrantyMonths;

    Integer totalViews;
    Integer totalPurchases;
    BigDecimal ratingAvg;
    Integer totalReviews;

    String categoryId;
    String categoryName;
    String brandId;
    String brandName;

    Set<String> tags;
    ProductStatus status;

    ProductImageResponse images;
    SpecificationResponse specification;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    LocalDateTime updatedAt;

    LocalDateTime deletedAt;;
}
