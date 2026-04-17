package com.haui.vtech.dto.color;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ColorRequest {
    @NotBlank(message = "COLOR_NAME_NOTBLANK")
    private String colorName;

    private String hexCode;
}
