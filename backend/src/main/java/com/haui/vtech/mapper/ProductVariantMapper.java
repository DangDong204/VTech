package com.haui.vtech.mapper;

import com.haui.vtech.dto.product.ProductVariantRequest;
import com.haui.vtech.dto.product.ProductVariantResponse;
import com.haui.vtech.entity.ProductVariantEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {

    ProductVariantEntity toEntity(ProductVariantRequest request);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.productName")
    @Mapping(target = "colorId", source = "color.id")
    @Mapping(target = "colorName", source = "color.colorName")
    @Mapping(target = "versionId", source = "version.id")
    @Mapping(target = "versionName", source = "version.versionName")
    ProductVariantResponse toResponse(ProductVariantEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget ProductVariantEntity entity, ProductVariantRequest request);
}
