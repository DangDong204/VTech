package com.haui.vtech.mapper;

import com.haui.vtech.dto.version.VersionRequest;
import com.haui.vtech.dto.version.VersionResponse;
import com.haui.vtech.entity.VersionEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface VersionMapper {

    VersionEntity toEntity(VersionRequest request);

    VersionResponse toResponse(VersionEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget VersionEntity entity, VersionRequest request);
}
