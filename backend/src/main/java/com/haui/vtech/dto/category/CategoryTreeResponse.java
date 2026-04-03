package com.haui.vtech.dto.category;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CategoryTreeResponse {
    private String id;
    private String categoryName;
    private String slug;
    private String categoryDesc;
    private String thumbnailUrl;
    private Integer displayOrder;
    private List<CategoryTreeResponse> children;
}
