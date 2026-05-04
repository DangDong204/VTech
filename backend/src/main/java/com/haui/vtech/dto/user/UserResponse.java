package com.haui.vtech.dto.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.vtech.enums.Gender;
import com.haui.vtech.enums.UserStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatar;
    private UserStatus status;
    private Set<String> roles;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;
//    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime deletedAt;

    private Gender gender;
    private java.time.LocalDate dob;
    private Integer currentVpoint;
    private Integer totalVpoint;
    private String memberTier;
}
