package com.haui.vtech.dto.receipt;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ReceiptRequest {
    private String supplierId;
    private String note;
    private List<ReceiptDetailRequest> details;
}
