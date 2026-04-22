package com.haui.vtech.dto.receipt;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ReceiptDetailRequest {
    // Dành cho việc tạo phiếu nhập bằng tay trên UI
    @NotBlank(message = "VARIANT_NOT_FOUND")
    private String variantId;

    @NotNull
    @Min(value = 1)
    private Integer quantity;

    @NotNull
    @Min(value = 0)
    private BigDecimal importPrice;
}
