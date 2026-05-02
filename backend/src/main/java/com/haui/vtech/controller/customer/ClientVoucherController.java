package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.voucher.CheckVoucherRequest;
import com.haui.vtech.dto.voucher.CheckVoucherResponse;
import com.haui.vtech.dto.voucher.VoucherResponse;
import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.repository.UserRepository;
import com.haui.vtech.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/client/vouchers")
@RequiredArgsConstructor
public class ClientVoucherController {

    private final VoucherService voucherService;
    private final UserRepository userRepository;

    @PostMapping("/check")
    public ApiResponse<CheckVoucherResponse> checkVoucher(@RequestBody CheckVoucherRequest request) {
        return ApiResponse.<CheckVoucherResponse>builder()
                .data(voucherService.checkVoucher(request))
                .message("Áp dụng mã giảm giá thành công")
                .build();
    }

    @GetMapping("/redeemable")
    public ApiResponse<List<VoucherResponse>> getRedeemableVouchers() {
        return ApiResponse.<List<VoucherResponse>>builder()
                .data(voucherService.getRedeemableVouchers())
                .build();
    }

    @PostMapping("/redeem/{voucherId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<Void> redeemVoucher(@PathVariable String voucherId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // Bạn cần gọi userRepository để tìm User theo email và lấy ID
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        voucherService.redeemVoucher(user.getId(), voucherId);

        return ApiResponse.<Void>builder()
                .message("Đổi V-Point lấy mã giảm giá thành công!")
                .build();
    }

    @GetMapping("/my-wallet")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<List<VoucherResponse>> getMyVouchers() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return ApiResponse.<List<VoucherResponse>>builder()
                .data(voucherService.getMyVouchers(user.getId()))
                .build();
    }
}