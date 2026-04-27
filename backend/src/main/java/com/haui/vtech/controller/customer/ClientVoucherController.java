package com.haui.vtech.controller.customer;

import com.haui.vtech.dto.ApiResponse;
import com.haui.vtech.dto.voucher.CheckVoucherRequest;
import com.haui.vtech.dto.voucher.CheckVoucherResponse;
import com.haui.vtech.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/client/vouchers")
@RequiredArgsConstructor
public class ClientVoucherController {

    private final VoucherService voucherService;

    @PostMapping("/check")
    public ApiResponse<CheckVoucherResponse> checkVoucher(@RequestBody CheckVoucherRequest request) {
        return ApiResponse.<CheckVoucherResponse>builder()
                .data(voucherService.checkVoucher(request))
                .message("Áp dụng mã giảm giá thành công")
                .build();
    }
}