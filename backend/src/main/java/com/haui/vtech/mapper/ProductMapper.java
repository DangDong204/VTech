package com.haui.vtech.mapper;

import com.haui.vtech.dto.product.ProductCreationRequest;
import com.haui.vtech.dto.product.ProductResponse;
import com.haui.vtech.entity.ProductEntity;
import com.haui.vtech.entity.TagEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductEntity toEntity(ProductCreationRequest request);

    @Mapping(target = "categoryName", source = "category.categoryName")
    @Mapping(target = "brandName", source = "brand.brandName")
    @Mapping(target = "tags", expression = "java(mapTags(entity.getTags()))")
    ProductResponse toResponse(ProductEntity entity);

    default Set<String> mapTags(Set<TagEntity> tags) {
        if (tags == null) return null;
        return tags.stream()
                .map(TagEntity::getTagName)
                .collect(Collectors.toSet());
    }
}
