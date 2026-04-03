package com.haui.vtech.mapper;

import com.haui.vtech.dto.category.CategoryCreationRequest;
import com.haui.vtech.dto.category.CategoryResponse;
import com.haui.vtech.dto.category.CategoryTreeResponse;
import com.haui.vtech.dto.category.CategoryUpdateRequest;
import com.haui.vtech.entity.CategoryEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryEntity toEntity(CategoryCreationRequest request);

    CategoryResponse toResponse(CategoryEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "parentId", ignore = true)
    void updateEntity(@MappingTarget CategoryEntity entity, CategoryUpdateRequest request);

    @Mapping(target = "children", expression = "java(new java.util.ArrayList<>())")
    CategoryTreeResponse toTreeResponse(CategoryEntity entity);
}
