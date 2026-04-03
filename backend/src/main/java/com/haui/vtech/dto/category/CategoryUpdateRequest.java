package com.haui.vtech.dto.category;

import com.haui.vtech.enums.CategoryStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CategoryUpdateRequest {
    @NotBlank(message = "CATEGORY_NAME_NOTBLANK")
    private String categoryName;

    @NotBlank(message = "CATEGORY_SLUG_NOTBLANK")
    private String slug;

    private String categoryDesc;
    private String parentId;
    private Integer displayOrder;
    private CategoryStatus status;
}
