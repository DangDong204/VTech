package com.haui.vtech.mapper;

import com.haui.vtech.dto.promotion.PromotionRequest;
import com.haui.vtech.dto.promotion.PromotionResponse;
import com.haui.vtech.entity.PromotionEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface PromotionMapper {
    PromotionEntity toEntity(PromotionRequest request);

    PromotionResponse toResponse(PromotionEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget PromotionEntity entity, PromotionRequest request);
}
