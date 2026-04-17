package com.haui.vtech.dto.version;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VersionRequest {
    @NotBlank(message = "VERSION_NAME_NOTBLANK")
    private String versionName;
}
