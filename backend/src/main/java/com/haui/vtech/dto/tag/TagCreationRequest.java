package com.haui.vtech.dto.tag;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TagCreationRequest {
    @NotBlank(message = "TAG_NAME_NOTBLANK")
    @Size(max = 50, message = "TAG_NAME_MAX")
    private String tagName;

    @Size(max = 255, message = "TAG_DESC_MAX")
    private String tagDesc;
}
