package com.haui.vtech.service;

import com.haui.vtech.dto.review.ReviewReplyRequest;
import com.haui.vtech.dto.review.ReviewRequest;
import com.haui.vtech.dto.review.ReviewResponse;
import com.haui.vtech.enums.ReviewStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface ReviewService {

    ReviewResponse createReview(ReviewRequest request, String userId);

    List<ReviewResponse> getReviewsByProduct(String productId); // Dùng cho Khách hàng xem

    void voteHelpful(String reviewId, String userId);

    List<ReviewResponse> getAllReviews(); // Dùng cho Admin

    void replyToReview(String reviewId, ReviewReplyRequest request, String adminId);

    void updateReviewStatus(String reviewId, ReviewStatus status);

    Map<String, String> uploadReviewMedia(MultipartFile file);
}