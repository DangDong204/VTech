package com.haui.vtech.dto.user;

import com.haui.vtech.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MyProfileUpdateRequest {

    @NotBlank(message = "USERNAME_NOTBLANK")
    private String username;

    @NotBlank(message = "FULLNAME_NOTBLANK")
    private String fullName;

    @NotBlank(message = "PHONE_NOTBLANK")
    @Size(min = 8, message = "PHONE_INVALID")
    private String phone;

    @NotNull(message = "GENDER_NOTNULL")
    private Gender gender;
}