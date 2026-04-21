package com.haui.vtech.service;

import com.haui.vtech.dto.promotion.PromotionRequest;
import com.haui.vtech.dto.promotion.PromotionResponse;
import com.haui.vtech.entity.ProductVariantEntity;
import com.haui.vtech.entity.PromotionEntity;
import com.haui.vtech.enums.PromotionStatus;
import com.haui.vtech.enums.PromotionType;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.PromotionMapper;
import com.haui.vtech.repository.ProductVariantRepository;
import com.haui.vtech.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final PromotionMapper promotionMapper;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional
    public PromotionResponse create(PromotionRequest request) {
        if (promotionRepository.existsByPromotionName(request.getPromotionName())) {
            throw new AppException(ErrorCode.PROMOTION_NAME_EXISTED, request.getPromotionName());
        }

        validatePromotionDates(request.getStartDate(), request.getEndDate());

        validateVariantIds(request.getVariantIds());

        PromotionEntity entity = promotionMapper.toEntity(request);
        PromotionEntity savedPromotion = promotionRepository.save(entity);

        // Áp dụng giá khuyến mãi cho các biến thể được chọn
//        if (request.getVariantIds() != null && !request.getVariantIds().isEmpty()) {
//            applyPromotionToVariants(request.getVariantIds(), savedPromotion.getDiscountType(), savedPromotion.getDiscountValue());
//        }
        syncSalePriceForVariants(savedPromotion.getVariantIds());

        return promotionMapper.toResponse(savedPromotion);
    }

    @Override
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findByStatusNot(PromotionStatus.DELETED)
                .stream().map(promotionMapper::toResponse).toList();
    }

    @Override
    public PromotionResponse getById(String id) {
        return promotionRepository.findById(id).map(promotionMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND, id));
    }

    @Override
    @Transactional
    public PromotionResponse update(String id, PromotionRequest request) {
        PromotionEntity promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND, id));

        if (!promotion.getPromotionName().equals(request.getPromotionName()) &&
                promotionRepository.existsByPromotionName(request.getPromotionName())) {
            throw new AppException(ErrorCode.PROMOTION_NAME_EXISTED, request.getPromotionName());
        }

        validatePromotionDates(request.getStartDate(), request.getEndDate());
        validateVariantIds(request.getVariantIds());

        // Lấy danh sách ID cũ và mới để gộp chung lại đem đi đồng bộ
        Set<String> oldVariantIds = promotion.getVariantIds() == null ? new HashSet<>() : new HashSet<>(promotion.getVariantIds());
        Set<String> newVariantIds = request.getVariantIds() == null ? new HashSet<>() : new HashSet<>(request.getVariantIds());

        promotionMapper.updateEntity(promotion, request);
        promotion.getVariantIds().clear();
        promotion.getVariantIds().addAll(newVariantIds);

        // Lưu bản cập nhật vào DB
        PromotionEntity updatedPromotion = promotionRepository.saveAndFlush(promotion);

        // Gộp tất cả ID cũ và mới lại. Các ID cũ bị loại bỏ sẽ được hàm sync quét lại,
        // do chúng không còn nằm trong Promo này nữa, nó sẽ tự lùi về base_price hoặc áp dụng Promo khác.
        Set<String> allAffectedVariants = new HashSet<>();
        allAffectedVariants.addAll(oldVariantIds);
        allAffectedVariants.addAll(newVariantIds);

        syncSalePriceForVariants(allAffectedVariants);

        return promotionMapper.toResponse(updatedPromotion);
    }

    @Override
    @Transactional
    public String deleteHard(String id) {
        PromotionEntity promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND, id));

        // CHẶN XÓA NẾU ĐANG CÓ BIẾN THỂ LIÊN KẾT
        if (promotion.getVariantIds() != null && !promotion.getVariantIds().isEmpty()) {
            throw new AppException(ErrorCode.PROMOTION_IN_USE);
        }

        promotionRepository.delete(promotion);
        return promotion.getPromotionName();
    }

    @Override
    @Transactional
    public String deleteSoft(String id) {
        PromotionEntity promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND, id));

        // CHẶN XÓA NẾU ĐANG CÓ BIẾN THỂ LIÊN KẾT
        if (promotion.getVariantIds() != null && !promotion.getVariantIds().isEmpty()) {
            throw new AppException(ErrorCode.PROMOTION_IN_USE);
        }

        int affectedRows = promotionRepository.softDelete(id, LocalDateTime.now());
        if (affectedRows == 0) {
            throw new AppException(ErrorCode.PROMOTION_NOT_FOUND, id);
        }
        return promotion.getPromotionName();
    }

    @Override
    public List<PromotionResponse> getAllInTrash() {
        return promotionRepository.findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(PromotionStatus.DELETED)
                .stream().map(promotionMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public String restore(String id) {
        PromotionEntity promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND, id));

        int affectedRows = promotionRepository.restore(id);
        if (affectedRows == 0) {
            throw new AppException(ErrorCode.PROMOTION_NOT_FOUND, id);
        }
        return promotion.getPromotionName();
    }

    // Hàm kiểm tra tính hợp lệ của ngày bắt đầu và kết thúc khuyến mãi
    private void validatePromotionDates(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null && start.isAfter(end)) {
            throw new AppException(ErrorCode.PROMOTION_DATES_INVALID);
        }
    }
    private void syncSalePriceForVariants(Set<String> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) return;

        List<ProductVariantEntity> variants = productVariantRepository.findAllById(variantIds);

        // Chỉ lấy các promotion đang ACTIVE chứa các variant này
        List<PromotionEntity> activePromotions = promotionRepository.findActivePromotionsByVariantIds(variantIds);

        for (ProductVariantEntity variant : variants) {
            BigDecimal basePrice = variant.getBasePrice();
            BigDecimal minSalePrice = basePrice; // Mặc định giá nhỏ nhất là giá gốc

            // Quét qua tất cả các promotion đang hoạt động
            for (PromotionEntity promo : activePromotions) {
                // Nếu promotion này có chứa variant hiện tại
                if (promo.getVariantIds() != null && promo.getVariantIds().contains(variant.getId())) {
                    BigDecimal calculatedPrice = calculateDiscountPrice(basePrice, promo.getDiscountType(), promo.getDiscountValue());

                    // Cập nhật minSalePrice nếu tìm thấy mức giá rẻ hơn
                    if (calculatedPrice.compareTo(minSalePrice) < 0) {
                        minSalePrice = calculatedPrice;
                    }
                }
            }
            // Gán mức giá tốt nhất vừa tìm được
            variant.setSalePrice(minSalePrice);
        }
        productVariantRepository.saveAll(variants);
    }

    // Hàm phụ trợ tính giá dựa theo loại khuyến mãi
    private BigDecimal calculateDiscountPrice(BigDecimal basePrice, PromotionType type, BigDecimal discountValue) {
        BigDecimal newPrice = basePrice;
        if (type == PromotionType.FIXED_AMOUNT) {
            newPrice = basePrice.subtract(discountValue);
        } else if (type == PromotionType.PERCENTAGE) {
            BigDecimal discountAmt = basePrice.multiply(discountValue).divide(BigDecimal.valueOf(100));
            newPrice = basePrice.subtract(discountAmt);
        }
        return newPrice.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : newPrice;
    }

    // Hàm kiểm tra tính hợp lệ của danh sách variant IDs
    private void validateVariantIds(Set<String> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) {
            return; // Nếu không truyền variant nào thì hợp lệ (Promotion rỗng)
        }

        // Tìm tất cả variant có trong DB dựa trên danh sách ID gửi lên
        long existingCount = productVariantRepository.findAllById(variantIds).size();

        // Nếu số lượng tìm thấy không khớp với số lượng ID gửi lên -> Có ID ảo
        if (existingCount != variantIds.size()) {
            // Sử dụng luôn ErrorCode.VARIANT_NOT_FOUND đã có sẵn
            throw new AppException(ErrorCode.VARIANT_NOT_FOUND);
        }
    }
}
