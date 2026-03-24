package com.haui.vtech.service;

import com.haui.vtech.dto.user.UserCreationRequest;
import com.haui.vtech.dto.user.UserResponse;

public interface UserService {
    UserResponse create(UserCreationRequest request);
}
