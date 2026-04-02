package com.haui.vtech.mapper;

import com.haui.vtech.dto.brand.BrandCreationRequest;
import com.haui.vtech.dto.brand.BrandResponse;
import com.haui.vtech.dto.brand.BrandUpdateRequest;
import com.haui.vtech.entity.BrandEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface BrandMapper {
    BrandEntity toBrandEntity(BrandCreationRequest request);

    BrandResponse toBrandResponse(BrandEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget BrandEntity entity, BrandUpdateRequest request);
}
