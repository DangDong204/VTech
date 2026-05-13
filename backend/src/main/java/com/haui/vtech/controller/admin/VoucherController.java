package com.haui.vtech.controller.admin;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.voucher.VoucherRequest;
import com.haui.vtech.dto.voucher.VoucherResponse;
import com.haui.vtech.service.VoucherService;
import com.haui.vtech.util.MessageUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;
    private final MessageUtil messageUtil;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<VoucherResponse> createVoucher(
            @Valid @RequestBody VoucherRequest request
    ) {
        VoucherResponse response = voucherService.create(request);
        return ApiResponse.<VoucherResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("voucher.created.success", response.getVoucherCode()))
                .build();
    }

    @GetMapping

    public ApiResponse<List<VoucherResponse>> getAll() {
        return ApiResponse.<List<VoucherResponse>>builder()
                .data(voucherService.getAllVouchers())
                .build();
    }

    @GetMapping("/{voucherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<VoucherResponse> getById(@PathVariable String voucherId) {
        return ApiResponse.<VoucherResponse>builder()
                .data(voucherService.getById(voucherId))
                .build();
    }

    @PutMapping("/{voucherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<VoucherResponse> updateVoucher(
            @PathVariable String voucherId,
            @Valid @RequestBody VoucherRequest request
    ) {
        VoucherResponse response = voucherService.update(voucherId, request);
        return ApiResponse.<VoucherResponse>builder()
                .data(response)
                .message(messageUtil.getMessage("voucher.updated.success", response.getVoucherCode()))
                .build();
    }

    @DeleteMapping("/trash/{voucherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteVoucher(@PathVariable String voucherId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("voucher.deleted.success", voucherService.deleteHard(voucherId)))
                .build();
    }

    @DeleteMapping("/{voucherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteSoftVoucher(@PathVariable String voucherId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("voucher.deleted.soft.success", voucherService.deleteSoft(voucherId)))
                .build();
    }

    @GetMapping("/trash")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<VoucherResponse>> getAllInTrash() {
        return ApiResponse.<List<VoucherResponse>>builder()
                .data(voucherService.getAllInTrash())
                .build();
    }

    @PatchMapping("/trash/{voucherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> restoreVoucher(@PathVariable String voucherId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("voucher.restored.success", voucherService.restore(voucherId)))
                .build();
    }
}
