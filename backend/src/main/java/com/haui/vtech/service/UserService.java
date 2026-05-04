package com.haui.vtech.service;

import com.haui.vtech.dto.auth.ResetPasswordRequest;
import com.haui.vtech.dto.user.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    UserResponse create(UserCreationRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getById(String id);

    ProfileUpdateResponse updateProfile(String id,ProfileUpdateRequest request, MultipartFile file);

    void delete(String id);

    void deleteSoft(String id);

    List<UserResponse> getAllInTrash();

    void restore(String id);

    // TODO: getMyInfo
    UserResponse getMyProfile(String email);

    // TODO: changePassword
    void changePassword(String email, ChangePasswordRequest request);

    // TODO: verifyOtp
    void verifyOtp(String email, String otpCode);

    // TODO: resendOtp
    void resendOtp(String email);

    // TODO: forgotPassword
    void forgotPassword(String email);

    // TODO: resetPassword
    void resetPassword(ResetPasswordRequest request);

    // TODO: updateMyProfile
    ProfileUpdateResponse updateMyProfile(String email, MyProfileUpdateRequest request, MultipartFile file);
}
