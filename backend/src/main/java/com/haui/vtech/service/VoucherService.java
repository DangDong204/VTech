package com.haui.vtech.service;

import com.haui.vtech.dto.voucher.CheckVoucherRequest;
import com.haui.vtech.dto.voucher.CheckVoucherResponse;
import com.haui.vtech.dto.voucher.VoucherRequest;
import com.haui.vtech.dto.voucher.VoucherResponse;

import java.util.List;

public interface VoucherService {
    VoucherResponse create(VoucherRequest request);

    List<VoucherResponse> getAllVouchers();

    VoucherResponse getById(String id);

    VoucherResponse update(String id, VoucherRequest request);

    String deleteHard(String id);

    String deleteSoft(String id);

    List<VoucherResponse> getAllInTrash();

    String restore(String id);

    // CHECK VOUCHER - USE FOR ORDER
    CheckVoucherResponse checkVoucher(CheckVoucherRequest request);
}
