package com.haui.vtech.dto.category;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.vtech.enums.CategoryStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class CategoryResponse {
    private String id;
    private String categoryName;
    private String slug;
    private String categoryDesc;
    private String thumbnailUrl;
    private String parentId;
    private String parentName;
    private Integer displayOrder;
    private CategoryStatus status;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;;
}
