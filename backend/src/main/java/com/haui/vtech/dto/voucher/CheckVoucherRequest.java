package com.haui.vtech.dto.voucher;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CheckVoucherRequest {
    private String voucherCode;
    private BigDecimal subTotal; // Cần biết tổng tiền đơn hàng để xét điều kiện min_order_value
    private BigDecimal shippingFee; // Để tính toán giảm giá nếu là mã FREE_SHIP
}