package com.haui.vtech.dto.review;

import com.haui.vtech.enums.ReviewStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReviewResponse {
    private String id;
    private String userId;
    private String fullName;     // Tên người đánh giá
    private String avatarUrl;    // Ảnh đại diện (nếu có)

    private String productName;  // Tên sản phẩm (VD: iPhone 15 Pro Max)
    private String productImage; // Ảnh sản phẩm (Lấy từ imageUrl của ProductVariant)
    private String variantName;  // Phân loại hàng (VD: Titan tự nhiên, 256GB)

    private Integer rating;
    private String comment;
    private Integer helpfulCount;
    private ReviewStatus status;
    private LocalDateTime createdAt;

    private List<MediaDto> mediaList;
    private ReplyDto reply;

    @Data
    public static class MediaDto {
        private String id;
        private String mediaUrl;
        private String mediaType;
    }

    @Data
    public static class ReplyDto {
        private String id;
        private String replyText;
        private String adminName; // Tên nhân viên phản hồi
        private LocalDateTime createdAt;
    }
}