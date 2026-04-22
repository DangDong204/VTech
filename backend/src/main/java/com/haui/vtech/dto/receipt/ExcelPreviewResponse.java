package com.haui.vtech.dto.receipt;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class ExcelPreviewResponse {
    private int rowIndex; // Dòng số mấy trong Excel
    private String sku;
    private String productName; // Trả về tên để UI hiển thị cho đẹp
    private String variantId;   // Trả về ID để lát nữa Frontend dùng gọi API createManual
    private Integer quantity;
    private BigDecimal importPrice;

    @JsonProperty("isValid")
    private boolean isValid;    // Frontend dùng cái này để tô màu Xanh/Đỏ

    private List<String> errors; // Chứa thông báo lỗi nếu isValid = false
}