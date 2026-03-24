package com.haui.vtech.mapper;


import com.haui.vtech.dto.user.UserCreationRequest;
import com.haui.vtech.dto.user.UserResponse;
import com.haui.vtech.entity.RoleEntity;
import com.haui.vtech.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserEntity toEntity(UserCreationRequest request);

    @Mapping(target = "roles",
            expression = "java(mapRoleNames(userEntity))")
    UserResponse toUserResponse(UserEntity userEntity);

//    ProfileUpdateResponse toProfileUpdateResponse(UserEntity userEntity);

//    @Mapping(target = "password", ignore = true)
//    @Mapping(target = "email", ignore = true)
//    @Mapping(target = "roles", ignore = true)
//    void updateUser(@MappingTarget UserEntity userEntity, ProfileUpdateRequest request);

    default Set<String> mapRoleNames(UserEntity userEntity) {
        return (userEntity.getRoles() == null)
                ? null
                : userEntity.getRoles().stream()
                .map(RoleEntity::getName)
                .collect(Collectors.toSet());
    }
}

