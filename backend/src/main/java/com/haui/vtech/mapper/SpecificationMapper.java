package com.haui.vtech.mapper;

import com.haui.vtech.dto.product.SpecificationRequest;
import com.haui.vtech.dto.product.SpecificationResponse;
import com.haui.vtech.entity.SpecificationEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SpecificationMapper {
    SpecificationEntity toEntity(SpecificationRequest request);

    @Mapping(target = "productId", source = "product.id")
    SpecificationResponse toResponse(SpecificationEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(@MappingTarget SpecificationEntity entity, SpecificationRequest request);
}
