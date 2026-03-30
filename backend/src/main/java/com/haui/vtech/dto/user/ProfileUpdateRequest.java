package com.haui.vtech.dto.user;

import com.haui.vtech.enums.UserStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class ProfileUpdateRequest {
    @NotBlank(message = "USERNAME_NOTBLANK")
    private String username;
    private String fullName;
    private String phone;
    private String avatar;
    private UserStatus status;
    private Set<String> roles;
}
