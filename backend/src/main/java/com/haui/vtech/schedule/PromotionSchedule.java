package com.haui.vtech.schedule;

import com.haui.vtech.entity.ProductVariantEntity;
import com.haui.vtech.entity.PromotionEntity;
import com.haui.vtech.enums.PromotionStatus;
import com.haui.vtech.repository.ProductVariantRepository;
import com.haui.vtech.repository.PromotionRepository;
import com.haui.vtech.enums.PromotionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class PromotionSchedule {
    private final PromotionRepository promotionRepository;
    private final ProductVariantRepository productVariantRepository;

    @Scheduled(cron = "0 * * * * ?") // Quét mỗi phút 1 lần
    @Transactional
    public void deactivateExpiredPromotions() {
        LocalDateTime now = LocalDateTime.now();

        List<PromotionEntity> expiredPromotions = promotionRepository.findAll().stream()
                .filter(p -> p.getStatus() == PromotionStatus.ACTIVE)
                .filter(p -> p.getEndDate() != null && p.getEndDate().isBefore(now))
                .toList();

        if (expiredPromotions.isEmpty()) return;

        log.info("Tìm thấy {} chương trình khuyến mãi đã hết hạn. Đang tiến hành cập nhật...", expiredPromotions.size());

        Set<String> affectedVariantIds = new HashSet<>();

        for (PromotionEntity promotion : expiredPromotions) {
            promotion.setStatus(PromotionStatus.INACTIVE);
            if (promotion.getVariantIds() != null) {
                affectedVariantIds.addAll(promotion.getVariantIds());
            }
        }

        // Phải lưu trạng thái INACTIVE trước khi tính lại giá
        promotionRepository.saveAllAndFlush(expiredPromotions);

        // Tính lại giá cho các Variant bị ảnh hưởng
        if (!affectedVariantIds.isEmpty()) {
            List<ProductVariantEntity> variants = productVariantRepository.findAllById(affectedVariantIds);
            // Query này giờ đây sẽ KHÔNG chứa các Promotion vừa bị set thành INACTIVE nữa
            List<PromotionEntity> remainingActivePromos = promotionRepository.findActivePromotionsByVariantIds(affectedVariantIds);

            for (ProductVariantEntity variant : variants) {
                BigDecimal basePrice = variant.getBasePrice();
                BigDecimal minSalePrice = basePrice;

                for (PromotionEntity promo : remainingActivePromos) {
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

        log.info("Đã hoàn tất xử lý khuyến mãi hết hạn và đồng bộ lại giá cho {} biến thể.", affectedVariantIds.size());
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
