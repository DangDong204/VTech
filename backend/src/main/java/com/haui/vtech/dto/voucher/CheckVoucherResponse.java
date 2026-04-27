package com.haui.vtech.dto.voucher;

import com.haui.vtech.enums.VoucherType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CheckVoucherResponse {
    private String voucherId;
    private String voucherCode;
    private String voucherName;
    private VoucherType type;
    private BigDecimal discountAmount; // Số tiền được giảm
}