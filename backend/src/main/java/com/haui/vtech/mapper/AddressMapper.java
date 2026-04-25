package com.haui.vtech.mapper;

import com.haui.vtech.dto.address.AddressRequest;
import com.haui.vtech.dto.address.AddressResponse;
import com.haui.vtech.entity.UserAddressEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    UserAddressEntity toEntity(AddressRequest request);

    AddressResponse toResponse(UserAddressEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget UserAddressEntity entity, AddressRequest request);
}
