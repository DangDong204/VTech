package com.haui.vtech.dto.receipt;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.haui.vtech.enums.ReceiptStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class ReceiptResponse {
    private String id;
    private String receiptCode;
    private String supplierId;
    private String supplierName;
    private BigDecimal totalAmount;
    private String note;
    private ReceiptStatus status;
    private String createdBy; // Có thể map ra tên Staff nếu muốn

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime updatedAt;

    private List<ReceiptDetailResponse> details;
}
