package com.haui.vtech.dto.voucher;

import com.haui.vtech.enums.VoucherStatus;
import com.haui.vtech.enums.VoucherType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VoucherRequest {
    @NotBlank(message = "VOUCHER_CODE_NOTBLANK")
    private String voucherCode;

    @NotBlank(message = "VOUCHER_NAME_NOTBLANK")
    private String voucherName;

    @NotNull(message = "UNCATEGORIZED_EXCEPTION")
    private VoucherType type;

    @NotNull(message = "VOUCHER_VALUE_INVALID")
    @Min(value = 0, message = "VOUCHER_VALUE_INVALID")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountAmount;

    @NotNull(message = "VOUCHER_VALUE_INVALID")
    @Min(value = 0, message = "VOUCHER_VALUE_INVALID")
    private BigDecimal minOrderValue;

    private Integer usageLimit;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private VoucherStatus status;

    @Min(value = 0, message = "VOUCHER_VALUE_INVALID")
    private Integer requiredPoints;
}
