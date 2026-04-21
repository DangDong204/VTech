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
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
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
    public ApiResponse<VoucherResponse> getById(@PathVariable String voucherId) {
        return ApiResponse.<VoucherResponse>builder()
                .data(voucherService.getById(voucherId))
                .build();
    }

    @PutMapping("/{voucherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> deleteVoucher(@PathVariable String voucherId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("voucher.deleted.success", voucherService.deleteHard(voucherId)))
                .build();
    }

    @DeleteMapping("/{voucherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> deleteSoftVoucher(@PathVariable String voucherId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("voucher.deleted.soft.success", voucherService.deleteSoft(voucherId)))
                .build();
    }

    @GetMapping("/trash")
    public ApiResponse<List<VoucherResponse>> getAllInTrash() {
        return ApiResponse.<List<VoucherResponse>>builder()
                .data(voucherService.getAllInTrash())
                .build();
    }

    @PatchMapping("/trash/{voucherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ApiResponse<Void> restoreVoucher(@PathVariable String voucherId) {
        return ApiResponse.<Void>builder()
                .message(messageUtil.getMessage("voucher.restored.success", voucherService.restore(voucherId)))
                .build();
    }
}
