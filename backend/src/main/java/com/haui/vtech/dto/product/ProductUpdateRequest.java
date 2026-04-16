package com.haui.vtech.dto.product;

import com.haui.vtech.enums.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateRequest {
    @NotBlank(message = "PRODUCT_NAME_NOTBLANK")
    String productName;
    @NotBlank(message = "PRODUCT_SLUG_NOTBLANK")
    String slug;

    String productDesc;

    Integer warrantyMonths;

    String categoryId;
    String brandId;

    Set<String> tagIds;

    ProductStatus status;
}
