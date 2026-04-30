package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.review.ReviewRequest;
import com.haui.vtech.dto.review.ReviewResponse;
import com.haui.vtech.security.CustomUserDetails;
import com.haui.vtech.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/client/reviews")
@RequiredArgsConstructor
public class ClientReviewController {

    private final ReviewService reviewService;

    // API public: Lấy danh sách review theo sản phẩm
    @GetMapping("/product/{productId}")
    public ApiResponse<List<ReviewResponse>> getProductReviews(@PathVariable String productId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .data(reviewService.getReviewsByProduct(productId))
                .build();
    }

    // API protected: Gửi đánh giá mới
    @PostMapping
    public ApiResponse<ReviewResponse> createReview(@RequestBody @Valid ReviewRequest request) {
        String userId = getUserIdFromContext();

        return ApiResponse.<ReviewResponse>builder()
                .message("Đánh giá sản phẩm thành công")
                .data(reviewService.createReview(request, userId))
                .build();
    }

    // API protected: Bấm "Hữu ích"
    @PostMapping("/{reviewId}/helpful")
    public ApiResponse<Void> voteHelpful(@PathVariable String reviewId) {
        String userId = getUserIdFromContext();

        reviewService.voteHelpful(reviewId, userId);
        return ApiResponse.<Void>builder()
                .message("Đã đánh dấu là hữu ích")
                .build();
    }

    // THÊM API NÀY VÀO ClientReviewController.java
    @PostMapping(value = "/upload-media", consumes = "multipart/form-data")
    public ApiResponse<Map<String, String>> uploadMedia(
            @RequestParam("file") MultipartFile file) {

        getUserIdFromContext();

        return ApiResponse.<Map<String, String>>builder()
                .message("Tải tệp lên thành công")
                .data(reviewService.uploadReviewMedia(file))
                .build();
    }

    /**
     * Hàm helper để trích xuất User ID từ Context hiện tại
     */
    private String getUserIdFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails customUserDetails) {
            return customUserDetails.getUser().getId();
        }
        // Fallback an toàn (mặc dù Filter đã chặn nếu chưa đăng nhập rồi)
        throw new com.haui.vtech.exception.AppException(com.haui.vtech.exception.ErrorCode.UNAUTHENTICATED);
    }
}