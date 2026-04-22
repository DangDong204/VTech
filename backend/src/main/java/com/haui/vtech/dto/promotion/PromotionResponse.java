package com.haui.vtech.dto.promotion;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.vtech.enums.PromotionStatus;
import com.haui.vtech.enums.PromotionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class PromotionResponse {
    private String id;
    private String promotionName;
    private String promotionDesc;
    private PromotionType discountType;
    private BigDecimal discountValue;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime startDate;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime endDate;

    private PromotionStatus status;
    private Set<String> variantIds;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
