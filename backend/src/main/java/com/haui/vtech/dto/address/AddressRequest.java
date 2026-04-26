package com.haui.vtech.dto.address;

import com.haui.vtech.enums.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String recipientName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không đúng định dạng")
    private String phone;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String provinceId;
    private String provinceName;

    @NotBlank(message = "Quận/Huyện không được để trống")
    private String districtId;
    private String districtName;

    @NotBlank(message = "Phường/Xã không được để trống")
    private String wardId;
    private String wardName;

    @NotBlank(message = "Địa chỉ cụ thể không được để trống")
    private String specificAddress;

    private AddressType addressType;
    private Boolean isDefault;
}
