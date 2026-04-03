package com.haui.vtech.dto.category;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CategoryCreationRequest {
    @NotBlank(message = "CATEGORY_NAME_NOTBLANK")
    private String categoryName;

    @NotBlank(message = "CATEGORY_SLUG_NOTBLANK")
    private String slug;

    private String categoryDesc;
    private String parentId;
    private Integer displayOrder;
}
