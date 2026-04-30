package com.haui.vtech.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ReviewRequest {
    @NotBlank(message = "ORDER_DETAIL_ID_NOTBLANK") // Sẽ định nghĩa trong ErrorCode sau
    private String orderDetailId;

    @NotNull(message = "RATING_NOTNULL")
    @Min(value = 1, message = "RATING_INVALID")
    @Max(value = 5, message = "RATING_INVALID")
    private Integer rating;

    private String comment;

    // Gửi kèm danh sách URL ảnh/video đã upload qua API upload
    private List<MediaDto> mediaList;

    @Data
    public static class MediaDto {
        private String mediaUrl;
        private String mediaType; // "IMAGE" hoặc "VIDEO"
    }
}