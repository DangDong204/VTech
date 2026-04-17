package com.haui.vtech.mapper;

import com.haui.vtech.dto.product.ProductCreationRequest;
import com.haui.vtech.dto.product.ProductImageResponse;
import com.haui.vtech.dto.product.ProductResponse;
import com.haui.vtech.dto.product.ProductUpdateRequest;
import com.haui.vtech.entity.ProductEntity;
import com.haui.vtech.entity.ProductImageEntity;
import com.haui.vtech.entity.ProductVariantEntity;
import com.haui.vtech.entity.TagEntity;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {SpecificationMapper.class})
public interface ProductMapper {

    ProductEntity toEntity(ProductCreationRequest request);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.categoryName")
    @Mapping(target = "brandId", source = "brand.id")
    @Mapping(target = "brandName", source = "brand.brandName")
    @Mapping(target = "tags", expression = "java(mapTags(entity.getTags()))")
    @Mapping(target = "specification", source = "specification")
    @Mapping(target = "images", expression = "java(mapImages(entity.getImages()))")
    @Mapping(target = "totalStock", expression = "java(calculateTotalStock(entity.getVariants()))")
    @Mapping(target = "minPrice", expression = "java(calculateMinPrice(entity.getVariants()))")
    @Mapping(target = "maxPrice", expression = "java(calculateMaxPrice(entity.getVariants()))")
    ProductResponse toResponse(ProductEntity entity);

    default Set<String> mapTags(Set<TagEntity> tags) {
        if (tags == null) return null;
        return tags.stream()
                .map(TagEntity::getTagName)
                .collect(Collectors.toSet());
    }

    default ProductImageResponse mapImages(Set<ProductImageEntity> images) {
        if (images == null || images.isEmpty()) {
            return ProductImageResponse.builder().build();
        }

        String thumbnail = null;
        List<String> gallery = new ArrayList<>();

        // Sort lại theo displayOrder để hiển thị đúng thứ tự trên frontend (như ReactJS)
        List<ProductImageEntity> sortedImages = images.stream()
                .sorted(Comparator.comparing(img -> img.getDisplayOrder() == null ? 0 : img.getDisplayOrder()))
                .toList();

        for (ProductImageEntity img : sortedImages) {
            if (Boolean.TRUE.equals(img.getIsThumbnail())) {
                thumbnail = img.getImageUrl();
            } else {
                gallery.add(img.getImageUrl());
            }
        }

        return ProductImageResponse.builder()
                .thumbnail(thumbnail)
                .images(gallery)
                .build();
    }

    default Integer calculateTotalStock(Set<ProductVariantEntity> variants) {
        if (variants == null || variants.isEmpty()) return 0;
        return variants.stream()
                .mapToInt(v -> v.getStockQuantity() == null ? 0 : v.getStockQuantity())
                .sum();
    }

    default BigDecimal calculateMinPrice(Set<ProductVariantEntity> variants) {
        if (variants == null || variants.isEmpty()) return BigDecimal.ZERO;
        return variants.stream()
                .map(v -> v.getSalePrice() != null ? v.getSalePrice() : v.getBasePrice())
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    default BigDecimal calculateMaxPrice(Set<ProductVariantEntity> variants) {
        if (variants == null || variants.isEmpty()) return BigDecimal.ZERO;
        return variants.stream()
                .map(v -> v.getSalePrice() != null ? v.getSalePrice() : v.getBasePrice())
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget ProductEntity entity, ProductUpdateRequest request);
}
