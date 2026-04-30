package com.haui.vtech.dto.review;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewReplyRequest {
    @NotBlank(message = "REPLY_TEXT_NOTBLANK")
    private String replyText;
}