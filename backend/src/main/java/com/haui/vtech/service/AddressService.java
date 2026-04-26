package com.haui.vtech.service;

import com.haui.vtech.dto.address.AddressRequest;
import com.haui.vtech.dto.address.AddressResponse;

import java.util.List;

public interface AddressService {

    List<AddressResponse> getMyAddresses(String userId);

    AddressResponse createAddress(String userId, AddressRequest request);

    AddressResponse updateAddress(String userId, String addressId, AddressRequest request);

    void deleteAddress(String userId, String addressId);

    void setDefaultAddress(String userId, String addressId);
}
