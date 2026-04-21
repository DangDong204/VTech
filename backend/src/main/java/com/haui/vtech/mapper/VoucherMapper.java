package com.haui.vtech.mapper;

import com.haui.vtech.dto.voucher.VoucherRequest;
import com.haui.vtech.dto.voucher.VoucherResponse;
import com.haui.vtech.entity.VoucherEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface VoucherMapper {
    VoucherEntity toEntity(VoucherRequest request);

    VoucherResponse toResponse(VoucherEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget VoucherEntity entity, VoucherRequest request);
}
