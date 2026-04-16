package com.haui.vtech.mapper;

import com.haui.vtech.dto.tag.TagCreationRequest;
import com.haui.vtech.dto.tag.TagResponse;
import com.haui.vtech.dto.tag.TagUpdateRequest;
import com.haui.vtech.entity.TagEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface TagMapper {
    TagEntity toTagEntity(TagCreationRequest request);

    TagResponse toTagResponse(TagEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget TagEntity entity, TagUpdateRequest request);
}
