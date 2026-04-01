package com.haui.vtech.dto.user;

import com.haui.vtech.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileUpdateResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatar;
    private UserStatus status;
}
