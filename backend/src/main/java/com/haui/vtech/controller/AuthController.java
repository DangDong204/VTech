package com.haui.vtech.controller;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.auth.*;
import com.haui.vtech.dto.user.UserCreationRequest;
import com.haui.vtech.dto.user.UserResponse;
import com.haui.vtech.security.CustomUserDetailsService;
import com.haui.vtech.service.JwtService;
import com.haui.vtech.service.UserService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final MessageUtil messageUtil;
    private final UserService userService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        // 1. Xác thực thông tin qua Spring Security (Tự động băm password và so sánh với DB)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Nếu xác thực qua, lấy thông tin user ra
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        // 3. Tạo token
        String jwtToken = jwtService.generateToken(userDetails);

        // 4. Trả về
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(jwtToken)
                .tokenType("Bearer")
                .build();

        return ApiResponse.<AuthResponse>builder()
                .data(authResponse)
                .message("Đăng nhập thành công")
                .build();
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody UserCreationRequest request ) {
        return ApiResponse.<UserResponse>builder()
                .data(userService.create(request))
                .message(messageUtil.getMessage("created.success"))
                .build();
    }

    @PostMapping("/verify-otp")
    public ApiResponse<Void> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        userService.verifyOtp(request.getEmail(), request.getOtpCode());
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("otp.verified.success"))
                .build();
    }

    @PostMapping("/resend-otp")
    public ApiResponse<Void> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        userService.resendOtp(request.getEmail());
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("otp.sent.success"))
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getEmail());
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("otp.sent.success"))
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("reset.password.success"))
                .build();
    }
}