package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.user.ProfileUpdateRequest;
import com.haui.vtech.dto.user.ProfileUpdateResponse;
import com.haui.vtech.dto.user.UserCreationRequest;
import com.haui.vtech.dto.user.UserResponse;
import com.haui.vtech.service.UserService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final MessageUtil messageUtil;
    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody UserCreationRequest request ) {
        return ApiResponse.<UserResponse>builder()
                .data(userService.create(request))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    @GetMapping
    public ApiResponse<List<UserResponse>> getAll() {
        return ApiResponse.<List<UserResponse>>builder()
                .data(userService.getAllUsers())
                .build();
    }

    @GetMapping("/{userId}")
    public UserResponse getUser(@PathVariable String userId) {
        return  userService.getById(userId);
    }

    @PutMapping("/{userId}")
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
    public ApiResponse<Void> deleteUser(@PathVariable String userId) {
        userService.delete(userId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.success"))
                .build();
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<Void> deleteSoftUser(@PathVariable String userId) {
        userService.deleteSoft(userId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("deleted.soft.success"))
                .build();
    }

    @GetMapping("/trash")
    public ApiResponse<List<UserResponse>> getAllInTrash() {
        return ApiResponse.<List<UserResponse>>builder()
                .data(userService.getAllInTrash())
                .build();
    }

    @PatchMapping("/trash/{userId}")
    public ApiResponse<Void> restoreUser(@PathVariable String userId) {
        userService.restore(userId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("restored.success"))
                .build();
    }

}
