package com.haui.vtech.mapper;

import com.haui.vtech.dto.color.ColorRequest;
import com.haui.vtech.dto.color.ColorResponse;
import com.haui.vtech.entity.ColorEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ColorMapper {

    ColorEntity toEntity(ColorRequest request);

    ColorResponse toResponse(ColorEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget ColorEntity entity, ColorRequest request);
}
