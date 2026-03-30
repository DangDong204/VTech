package com.haui.vtech.service;

import com.haui.vtech.dto.user.ProfileUpdateRequest;
import com.haui.vtech.dto.user.ProfileUpdateResponse;
import com.haui.vtech.dto.user.UserCreationRequest;
import com.haui.vtech.dto.user.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse create(UserCreationRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getById(String id);

    ProfileUpdateResponse updateProfile(String id,ProfileUpdateRequest request);

    void delete(String id);

    void deleteSoft(String id);

    List<UserResponse> getAllInTrash();

    void restore(String id);

    // TODO: getMyInfo
    // TODO: changePassword
}
