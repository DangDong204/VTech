package com.haui.vtech.dto.category;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ClientCategoryResponse {
    private String id;
    private String categoryName;
    private String slug;
    private String thumbnailUrl;
}