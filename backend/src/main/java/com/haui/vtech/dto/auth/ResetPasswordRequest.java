package com.haui.vtech.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "EMAIL_NOTBLANK")
    @Email(message = "EMAIL_VALID")
    private String email;

    @NotBlank
    private String otpCode;

    @NotBlank
    @Size(min = 6, message = "PASSWORD_INVALID")
    private String newPassword;

    @NotBlank
    private String confirmPassword;
}