package com.haui.vtech.service;

import com.haui.vtech.dto.review.ReviewReplyRequest;
import com.haui.vtech.dto.review.ReviewRequest;
import com.haui.vtech.dto.review.ReviewResponse;
import com.haui.vtech.entity.*;
import com.haui.vtech.enums.ImageFolder;
import com.haui.vtech.enums.MediaType;
import com.haui.vtech.enums.ReviewStatus;
import com.haui.vtech.enums.VpointTransactionType; // BỔ SUNG
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.ReviewMapper;
import com.haui.vtech.repository.*;
import com.haui.vtech.util.FileValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final ReviewHelpfulVoteRepository voteRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final ReviewMapper reviewMapper;
    private final S3Service s3Service;
    private final VpointService vpointService; // BỔ SUNG: Tiêm VpointService

    @Value("${app.review.sensitive-words}")
    private List<String> sensitiveWords;

    @Value("${app.vpoint.reward.review-text:10}")
    private int reviewTextPoints;

    @Value("${app.vpoint.reward.review-media:50}")
    private int reviewMediaPoints;

    // ==========================================
    // HÀM HELPER TÍNH TOÁN LẠI ĐIỂM SẢN PHẨM
    // ==========================================
    private void updateProductReviewStats(ProductEntity product) {
        // Chỉ lấy những đánh giá đã được APPROVED để tính điểm
        List<ReviewEntity> approvedReviews = reviewRepository.findByProductIdAndStatusOrderByIdDesc(product.getId(), ReviewStatus.APPROVED);

        if (approvedReviews.isEmpty()) {
            product.setTotalReviews(0);
            product.setRatingAvg(BigDecimal.ZERO);
        } else {
            product.setTotalReviews(approvedReviews.size());
            double average = approvedReviews.stream()
                    .mapToInt(ReviewEntity::getRating)
                    .average()
                    .orElse(0.0);
            // Làm tròn 1 chữ số thập phân (VD: 4.5, 4.8)
            product.setRatingAvg(BigDecimal.valueOf(average).setScale(1, RoundingMode.HALF_UP));
        }
        productRepository.save(product);
    }

    // ==========================================
    // BỔ SUNG: HÀM HELPER TẶNG ĐIỂM V-POINT KHI REVIEW ĐƯỢC DUYỆT
    // ==========================================
    private void awardPointsForReview(ReviewEntity review) {

        int points = reviewTextPoints;
        VpointTransactionType type = VpointTransactionType.EARN_REVIEW_TEXT;
        String desc = "Tích điểm Đánh giá sản phẩm: " + review.getProduct().getProductName();

        if (review.getMediaList() != null && !review.getMediaList().isEmpty()) {
            points = reviewMediaPoints; // SỬA Ở ĐÂY
            type = VpointTransactionType.EARN_REVIEW_MEDIA;
            desc = "Tích điểm Đánh giá sản phẩm (Có hình ảnh/video): " + review.getProduct().getProductName();
        }

        vpointService.addPoints(review.getUser().getId(), points, type, review.getId(), desc);
    }

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest request, String userId) {
        OrderDetailEntity orderDetail = orderDetailRepository.findById(request.getOrderDetailId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        ProductVariantEntity variant = productVariantRepository.findById(orderDetail.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND));

        if (reviewRepository.existsByOrderDetailId(orderDetail.getId())) {
            throw new AppException(ErrorCode.REVIEW_EXISTS_FOR_ORDER);
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ReviewEntity review = reviewMapper.toEntity(request);
        review.setUser(user);
        review.setOrderDetail(orderDetail);
        review.setProductVariant(variant);
        review.setProduct(variant.getProduct());

        // ==========================================
        // LOGIC KIỂM DUYỆT
        // ==========================================
        boolean needsModeration = false;

        if (request.getMediaList() != null && !request.getMediaList().isEmpty()) {
            needsModeration = true;
        }

        if (!needsModeration && request.getComment() != null) {
            String lowerComment = request.getComment().toLowerCase();
            for (String word : sensitiveWords) {
                if (lowerComment.contains(word.trim().toLowerCase())) {
                    needsModeration = true;
                    break;
                }
            }
        }

        if (needsModeration) {
            review.setStatus(ReviewStatus.PENDING);
        } else {
            review.setStatus(ReviewStatus.APPROVED);
        }
        // ==========================================

        if (request.getMediaList() != null && !request.getMediaList().isEmpty()) {
            List<ReviewMediaEntity> mediaEntities = request.getMediaList().stream().map(m -> {
                ReviewMediaEntity media = new ReviewMediaEntity();
                media.setReview(review);
                media.setMediaUrl(m.getMediaUrl());
                media.setMediaType(MediaType.valueOf(m.getMediaType()));
                return media;
            }).collect(Collectors.toList());
            review.setMediaList(mediaEntities);
        } else {
            review.setMediaList(new ArrayList<>());
        }

        // 1. Lưu Review vào DB trước
        ReviewEntity savedReview = reviewRepository.save(review);

        // 2. NẾU ĐÁNH GIÁ ĐƯỢC APPROVED LUÔN (Không có từ nhạy cảm, không có ảnh)
        if (savedReview.getStatus() == ReviewStatus.APPROVED) {
            updateProductReviewStats(savedReview.getProduct());
            awardPointsForReview(savedReview); // BỔ SUNG: Tặng điểm ngay
        }

        return reviewMapper.toResponse(savedReview);
    }

    @Override
    public List<ReviewResponse> getReviewsByProduct(String productId) {
        return reviewRepository.findByProductIdAndStatusOrderByIdDesc(productId, ReviewStatus.APPROVED).stream()
                .map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void voteHelpful(String reviewId, String userId) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        Optional<ReviewHelpfulVoteEntity> existingVote = voteRepository.findByReviewIdAndUserId(reviewId, userId);

        if (existingVote.isPresent()) {
            voteRepository.delete(existingVote.get());
            review.setHelpfulCount(Math.max(0, review.getHelpfulCount() - 1));
        } else {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            ReviewHelpfulVoteEntity vote = new ReviewHelpfulVoteEntity();
            vote.setReview(review);
            vote.setUser(user);
            voteRepository.save(vote);
            review.setHelpfulCount(review.getHelpfulCount() + 1);
        }

        reviewRepository.save(review);
    }

    @Override
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByIdDesc().stream().map(reviewMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void replyToReview(String reviewId, ReviewReplyRequest request, String adminId) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        if (reviewReplyRepository.existsByReviewId(reviewId)) {
            throw new AppException(ErrorCode.REPLY_ALREADY_EXISTS);
        }

        UserEntity admin = userRepository.findById(adminId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ReviewReplyEntity reply = new ReviewReplyEntity();
        reply.setReview(review);
        reply.setUser(admin);
        reply.setReplyText(request.getReplyText());

        reviewReplyRepository.save(reply);
    }

    @Override
    @Transactional
    public void updateReviewStatus(String reviewId, ReviewStatus status) {
        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Lưu lại trạng thái cũ để so sánh
        ReviewStatus oldStatus = review.getStatus();

        review.setStatus(status);
        reviewRepository.save(review);

        // NẾU TỪ PENDING -> APPROVED: Tính toán lại điểm trung bình SP và Tặng V-point cho khách
        if (oldStatus != ReviewStatus.APPROVED && status == ReviewStatus.APPROVED) {
            updateProductReviewStats(review.getProduct());
            awardPointsForReview(review); // BỔ SUNG: Admin vừa duyệt ảnh -> Khách được nhận 5000đ
        }
        // NẾU TỪ APPROVED -> HIDDEN (Admin ẩn bài): Tính toán lại điểm SP
        else if (oldStatus == ReviewStatus.APPROVED && status != ReviewStatus.APPROVED) {
            updateProductReviewStats(review.getProduct());

            // TÙY CHỌN: Nếu bạn muốn, có thể gọi vpointService.deductPoints() ở đây
            // để thu hồi điểm nếu phát hiện khách hàng review lừa đảo.
            // Nhưng thông thường sàn TMĐT ít khi trừ lại điểm Review, chỉ ẩn thôi là đủ răn đe.
        }
    }

    @Override
    public Map<String, String> uploadReviewMedia(MultipartFile file) {
        String mediaType = FileValidator.validateMediaAndGetType(file);
        String url = s3Service.uploadMedia(file, ImageFolder.REVIEW);
        return Map.of(
                "mediaUrl", url,
                "mediaType", mediaType
        );
    }
}