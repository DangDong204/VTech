package com.haui.vtech.service;

import com.haui.vtech.dto.address.AddressRequest;
import com.haui.vtech.dto.address.AddressResponse;
import com.haui.vtech.entity.UserAddressEntity;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.AddressMapper;
import com.haui.vtech.repository.UserAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {
    private final UserAddressRepository addressRepository;
    private final AddressMapper addressMapper;

    @Override
    public List<AddressResponse> getMyAddresses(String userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(addressMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse createAddress(String userId, AddressRequest request) {
        UserAddressEntity entity = addressMapper.toEntity(request);
        entity.setUserId(userId);

        // Nếu là địa chỉ đầu tiên, ép thành mặc định
        long count = addressRepository.countByUserId(userId);
        if (count == 0) {
            entity.setIsDefault(true);
        }

        // Nếu user tick chọn là mặc định, cần xóa cờ của các địa chỉ cũ
        if (Boolean.TRUE.equals(entity.getIsDefault()) && count > 0) {
            addressRepository.clearDefaultAddress(userId);
        }

        UserAddressEntity savedEntity = addressRepository.save(entity);
        return addressMapper.toResponse(savedEntity);
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(String userId, String addressId, AddressRequest request) {
        UserAddressEntity entity = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        addressMapper.updateEntity(entity, request);

        // Xử lý logic mặc định
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.clearDefaultAddress(userId);
            entity.setIsDefault(true); // Đảm bảo entity hiện tại vẫn giữ cờ
        }

        UserAddressEntity updatedEntity = addressRepository.save(entity);
        return addressMapper.toResponse(updatedEntity);
    }

    @Override
    @Transactional
    public void deleteAddress(String userId, String addressId) {
        UserAddressEntity entity = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        addressRepository.delete(entity);
    }

    @Override
    @Transactional
    public void setDefaultAddress(String userId, String addressId) {
        UserAddressEntity entity = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (!entity.getIsDefault()) {
            addressRepository.clearDefaultAddress(userId);
            entity.setIsDefault(true);
            addressRepository.save(entity);
        }
    }
}
