package com.haui.vtech.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "EMAIL_NOTBLANK")
    @Email(message = "EMAIL_VALID")
    private String email;

    @NotBlank(message = "PASSWORD_NOTBLANK")
    private String password;
}