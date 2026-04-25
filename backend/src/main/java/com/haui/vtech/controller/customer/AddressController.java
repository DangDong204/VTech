package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.address.AddressRequest;
import com.haui.vtech.dto.address.AddressResponse;
import com.haui.vtech.security.CustomUserDetails;
import com.haui.vtech.service.AddressService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/client/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final MessageUtil messageUtil;

    @GetMapping
    public ApiResponse<List<AddressResponse>> getMyAddresses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        return ApiResponse.<List<AddressResponse>>builder()
                .data(addressService.getMyAddresses(userId))
                .build();
    }

    @PostMapping
    public ApiResponse<AddressResponse> createAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {
        String userId = userDetails.getUser().getId();
        return ApiResponse.<AddressResponse>builder()
                .data(addressService.createAddress(userId, request))
                .message(messageUtil.getMessage("address.created.success"))
                .build();
    }

    @PutMapping("/{addressId}")
    public ApiResponse<AddressResponse> updateAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String addressId,
            @Valid @RequestBody AddressRequest request) {
        String userId = userDetails.getUser().getId();
        return ApiResponse.<AddressResponse>builder()
                .data(addressService.updateAddress(userId, addressId, request))
                .message(messageUtil.getMessage("address.updated.success"))
                .build();
    }

    @PatchMapping("/{addressId}/default")
    public ApiResponse<Void> setDefaultAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String addressId) {
        String userId = userDetails.getUser().getId();
        addressService.setDefaultAddress(userId, addressId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("address.default.success"))
                .build();
    }

    @DeleteMapping("/{addressId}")
    public ApiResponse<Void> deleteAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String addressId) {
        String userId = userDetails.getUser().getId();
        addressService.deleteAddress(userId, addressId);
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("address.deleted.success"))
                .build();
    }
}