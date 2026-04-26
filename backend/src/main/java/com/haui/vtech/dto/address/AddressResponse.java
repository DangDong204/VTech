package com.haui.vtech.dto.address;

import com.haui.vtech.enums.AddressType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private String id;
    private String recipientName;
    private String phone;
    private String provinceId;
    private String provinceName;
    private String districtId;
    private String districtName;
    private String wardId;
    private String wardName;
    private String specificAddress;
    private AddressType addressType;
    private Boolean isDefault;
}
