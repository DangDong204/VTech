package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.user.*;
import com.haui.vtech.service.UserService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final MessageUtil messageUtil;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> getAll() {
        return ApiResponse.<List<UserResponse>>builder()
                .data(userService.getAllUsers())
                .build();
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUser(@PathVariable String userId) {
        return  userService.getById(userId);
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ProfileUpdateResponse>  updateUser(
            @PathVariable String userId,
            @Valid @ModelAttribute ProfileUpdateRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        return ApiResponse.<ProfileUpdateResponse>builder()
                .data(userService.updateProfile(userId, request, file))
                .message(messageUtil.getMessage("updated.success"))
                .build();
    }

    @DeleteMapping("/trash/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteUser(@PathVariable String userId) {
        userService.delete(userId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteSoftUser(@PathVariable String userId) {
        userService.deleteSoft(userId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.soft.success"))
                .build();
    }

    @GetMapping("/trash")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> getAllInTrash() {
        return ApiResponse.<List<UserResponse>>builder()
                .data(userService.getAllInTrash())
                .build();
    }

    @PatchMapping("/trash/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> restoreUser(@PathVariable String userId) {
        userService.restore(userId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }

    @GetMapping("/my-profile")
    public ApiResponse<UserResponse> getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return ApiResponse.<UserResponse>builder()
                .data(userService.getMyProfile(email))
                .build();
    }

    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        userService.changePassword(email, request);

        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("password.changed.success"))
                .build();
    }

    @PutMapping(value = "/my-profile", consumes = MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProfileUpdateResponse> updateMyProfile(
            Principal principal,
            @Valid @ModelAttribute MyProfileUpdateRequest request,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        // Lấy email của user đang đăng nhập từ Token (Principal)
        String email = principal.getName();

        ProfileUpdateResponse response = userService.updateMyProfile(email, request, file);

        return ApiResponse.<ProfileUpdateResponse>builder()
                .data(response)
                .message("Cập nhật thông tin thành công")
                .build();
    }

}
