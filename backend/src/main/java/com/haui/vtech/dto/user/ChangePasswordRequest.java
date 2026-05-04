package com.haui.vtech.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "OLD_PASSWORD_NOTBLANK")
    private String oldPassword;

    @NotBlank(message = "NEW_PASSWORD_NOTBLANK")
    @Size(min = 6, message = "PASSWORD_INVALID")
    private String newPassword;

    @NotBlank(message = "NEW_PASSWORD_NOTBLANK")
    private String confirmPassword;
}