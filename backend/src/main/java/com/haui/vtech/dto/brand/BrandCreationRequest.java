package com.haui.vtech.dto.brand;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandCreationRequest {
    @NotBlank(message = "BRAND_NAME_NOTBLANK")
    private String brandName;
    @NotBlank(message = "BRAND_SLUG_NOTBLANK")
    private String slug;

    private String brandDesc;

    private Integer displayOrder;
}
