package com.haui.vtech.dto.voucher;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.vtech.enums.VoucherStatus;
import com.haui.vtech.enums.VoucherType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VoucherResponse {
    private String id;
    private String voucherCode;
    private String voucherName;
    private VoucherType type;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private Integer usageLimit;
    private Integer usedCount;
    private VoucherStatus status;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime startDate;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime endDate;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;;
}
