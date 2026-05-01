package com.haui.vtech.dto.promotion;

import com.haui.vtech.enums.PromotionStatus;
import com.haui.vtech.enums.PromotionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class PromotionRequest {
    @NotBlank(message = "PROMOTION_NAME_NOTBLANK")
    private String promotionName;

    private String promotionDesc;

    @NotNull(message = "PROMOTION_TYPE_INVALID")
    private PromotionType discountType;

    @NotNull(message = "PROMOTION_VALUE_INVALID")
    @Min(value = 0, message = "PROMOTION_VALUE_INVALID")
    private BigDecimal discountValue;

    @NotNull(message = "PROMOTION_DATES_INVALID")
    private LocalDateTime startDate;

    @NotNull(message = "PROMOTION_DATES_INVALID")
    private LocalDateTime endDate;

    // Danh sách ID các biến thể (Product Variants) áp dụng khuyến mãi
    private Set<String> variantIds;
}
