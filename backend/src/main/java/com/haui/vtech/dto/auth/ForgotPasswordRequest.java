package com.haui.vtech.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "EMAIL_NOTBLANK")
    @Email(message = "EMAIL_VALID")
    private String email;
}