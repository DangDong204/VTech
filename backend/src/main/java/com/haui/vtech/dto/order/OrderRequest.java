package com.haui.vtech.dto.order;

import com.haui.vtech.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    private List<String> cartDetailIds; // Các ID sản phẩm đang tick chọn trong giỏ

    @NotBlank(message = "Tên khách hàng không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String customerPhone;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String customerAddress;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    private BigDecimal shippingFee;
    private BigDecimal productDiscount; // Giá trị voucher (nếu có)
    private String note;
    private List<String> voucherIds;
}