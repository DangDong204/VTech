package com.haui.vtech.schedule;

import com.haui.vtech.entity.ProductVariantEntity;
import com.haui.vtech.entity.PromotionEntity;
import com.haui.vtech.enums.PromotionStatus;
import com.haui.vtech.enums.PromotionType;
import com.haui.vtech.repository.ProductVariantRepository;
import com.haui.vtech.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class PromotionSchedule {
    private final PromotionRepository promotionRepository;
    private final ProductVariantRepository productVariantRepository;

    @Scheduled(cron = "0 * * * * ?") // Quét tự động mỗi khi sang phút mới
    @Transactional
    public void processPromotions() {
        Set<String> affectedVariantIds = new HashSet<>();

        // 1. TÌM VÀ TẮT CÁC CHƯƠNG TRÌNH HẾT HẠN (ACTIVE -> INACTIVE)
        List<PromotionEntity> expiredPromotions = promotionRepository.findExpiredPromotions();
        for (PromotionEntity p : expiredPromotions) {
            p.setStatus(PromotionStatus.INACTIVE);
            if (p.getVariantIds() != null) affectedVariantIds.addAll(p.getVariantIds());
        }

        // 2. TÌM VÀ BẬT CÁC CHƯƠNG TRÌNH ĐẾN GIỜ (UPCOMING -> ACTIVE)
        List<PromotionEntity> startingPromotions = promotionRepository.findStartingPromotions();
        for (PromotionEntity p : startingPromotions) {
            p.setStatus(PromotionStatus.ACTIVE);
            if (p.getVariantIds() != null) affectedVariantIds.addAll(p.getVariantIds());
        }

        // 3. FIX LỖI DATA CŨ (Nếu lỡ có CT nào đang ACTIVE nhưng thời gian ở tương lai)
        List<PromotionEntity> invalidActivePromotions = promotionRepository.findInvalidActivePromotions();
        for (PromotionEntity p : invalidActivePromotions) {
            p.setStatus(PromotionStatus.UPCOMING);
            if (p.getVariantIds() != null) affectedVariantIds.addAll(p.getVariantIds());
        }

        if (affectedVariantIds.isEmpty()) return; // Không có biến động thì dừng

        log.info("CronJob: Cập nhật trạng thái cho {} promotion và đồng bộ giá cho {} biến thể.",
                (expiredPromotions.size() + startingPromotions.size() + invalidActivePromotions.size()),
                affectedVariantIds.size());

        // Lưu trạng thái mới vào DB trước
        promotionRepository.saveAll(expiredPromotions);
        promotionRepository.saveAll(startingPromotions);
        promotionRepository.saveAll(invalidActivePromotions);
        promotionRepository.flush();

        // 4. TÍNH TOÁN VÀ ĐỒNG BỘ LẠI GIÁ CHO SẢN PHẨM
        List<ProductVariantEntity> variants = productVariantRepository.findAllById(affectedVariantIds);
        List<PromotionEntity> activePromos = promotionRepository.findActivePromotionsByVariantIds(affectedVariantIds);

        for (ProductVariantEntity variant : variants) {
            BigDecimal basePrice = variant.getBasePrice();
            BigDecimal minSalePrice = basePrice;

            for (PromotionEntity promo : activePromos) {
                if (promo.getVariantIds() != null && promo.getVariantIds().contains(variant.getId())) {
                    BigDecimal calcPrice = calculateDiscountPrice(basePrice, promo.getDiscountType(), promo.getDiscountValue());
                    if (calcPrice.compareTo(minSalePrice) < 0) {
                        minSalePrice = calcPrice;
                    }
                }
            }
            variant.setSalePrice(minSalePrice);
        }
        productVariantRepository.saveAll(variants);
    }

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
}