package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.review.ReviewReplyRequest;
import com.haui.vtech.dto.review.ReviewResponse;
import com.haui.vtech.security.CustomUserDetails;
import com.haui.vtech.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ApiResponse<List<ReviewResponse>> getAllReviews() {
        return ApiResponse.<List<ReviewResponse>>builder()
                .data(reviewService.getAllReviews())
                .build();
    }

    @PostMapping("/{reviewId}/reply")
    public ApiResponse<Void> replyToReview(@PathVariable String reviewId, @RequestBody @Valid ReviewReplyRequest request) {
        // LẤY CHÍNH XÁC ID CỦA ADMIN/STAFF TỪ CONTEXT
        String adminId = getUserIdFromContext();

        reviewService.replyToReview(reviewId, request, adminId);
        return ApiResponse.<Void>builder()
                .message("Phản hồi đánh giá thành công")
                .build();
    }

    @PutMapping("/{reviewId}/status")
    public ApiResponse<Void> updateReviewStatus(
            @PathVariable String reviewId,
            @RequestParam("status") com.haui.vtech.enums.ReviewStatus status) {

        reviewService.updateReviewStatus(reviewId, status);
        return ApiResponse.<Void>builder()
                .message("Cập nhật trạng thái thành công")
                .build();
    }

    /**
     * Hàm helper để trích xuất User ID (UUID) từ Security Context
     */
    private String getUserIdFromContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails customUserDetails) {
            return customUserDetails.getUser().getId();
        }
        throw new com.haui.vtech.exception.AppException(com.haui.vtech.exception.ErrorCode.UNAUTHENTICATED);
    }
}