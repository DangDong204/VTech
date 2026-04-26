package com.haui.vtech.entity;

import com.haui.vtech.enums.AddressType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class UserAddressEntity extends BaseEntity{
    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    @Column(name = "phone", nullable = false, length = 15)
    private String phone;

    @Column(name = "province_id", length = 50)
    private String provinceId;

    @Column(name = "province_name", length = 100)
    private String provinceName;

    @Column(name = "district_id", length = 50)
    private String districtId;

    @Column(name = "district_name", length = 100)
    private String districtName;

    @Column(name = "ward_id", length = 50)
    private String wardId;

    @Column(name = "ward_name", length = 100)
    private String wardName;

    @Column(name = "specific_address", length = 255)
    private String specificAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "address_type", length = 20)
    private AddressType addressType;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @PrePersist
    public void prePersistDefault() {
        super.prePersist();
        if (isDefault == null) {
            isDefault = false;
        }
        if (addressType == null) {
            addressType = AddressType.HOME;
        }
    }
}
