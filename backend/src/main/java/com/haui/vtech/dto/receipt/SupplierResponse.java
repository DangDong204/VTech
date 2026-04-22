package com.haui.vtech.dto.receipt;

import com.haui.vtech.enums.SupplierStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SupplierResponse {
    private String id;
    private String supplierName;
    private String contactName;
    private String phone;
    private String email;
    private String address;
    private SupplierStatus status;
}
