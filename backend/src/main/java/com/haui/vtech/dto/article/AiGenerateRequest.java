package com.haui.vtech.dto.article;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiGenerateRequest {
    @NotBlank(message = "ARTICLE_TITLE_NOTBLANK")
    private String prompt;
}