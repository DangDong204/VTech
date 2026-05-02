package com.haui.vtech.mapper;

import com.haui.vtech.dto.vpoint.VpointHistoryResponse;
import com.haui.vtech.entity.VpointHistoryEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VpointMapper {

    VpointHistoryResponse toResponse(VpointHistoryEntity entity);

}