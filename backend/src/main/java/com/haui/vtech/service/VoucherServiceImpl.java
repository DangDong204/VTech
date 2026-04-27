package com.haui.vtech.service;

import com.haui.vtech.dto.voucher.CheckVoucherRequest;
import com.haui.vtech.dto.voucher.CheckVoucherResponse;
import com.haui.vtech.dto.voucher.VoucherRequest;
import com.haui.vtech.dto.voucher.VoucherResponse;
import com.haui.vtech.entity.VoucherEntity;
import com.haui.vtech.enums.VoucherStatus;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.VoucherMapper;
import com.haui.vtech.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherMapper voucherMapper;

    @Override
    public VoucherResponse create(VoucherRequest request) {
        if (voucherRepository.existsByVoucherCode(request.getVoucherCode())) {
            throw new AppException(ErrorCode.VOUCHER_CODE_EXISTED, request.getVoucherCode());
        }

        if (request.getStartDate() != null && request.getEndDate() != null &&
                request.getStartDate().isAfter(request.getEndDate())) {
            throw new AppException(ErrorCode.VOUCHER_DATES_INVALID);
        }

        VoucherEntity entity = voucherMapper.toEntity(request);
        return voucherMapper.toResponse(voucherRepository.save(entity));
    }

    @Override
    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findByStatusNot(VoucherStatus.DELETED).stream().map(voucherMapper::toResponse).toList();
    }

    @Override
    public VoucherResponse getById(String id) {
        return voucherRepository.findById(id).map(voucherMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND, id));
    }

    @Override
    public VoucherResponse update(String id, VoucherRequest request) {
        VoucherEntity voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND, id));

        if (!voucher.getVoucherCode().equals(request.getVoucherCode()) &&
                voucherRepository.existsByVoucherCode(request.getVoucherCode())) {
            throw new AppException(ErrorCode.VOUCHER_CODE_EXISTED, request.getVoucherCode());
        }

        if (request.getStartDate() != null && request.getEndDate() != null &&
                request.getStartDate().isAfter(request.getEndDate())) {
            throw new AppException(ErrorCode.VOUCHER_DATES_INVALID);
        }

        voucherMapper.updateEntity(voucher, request);
        return voucherMapper.toResponse(voucherRepository.save(voucher));
    }

    @Override
    public String deleteHard(String id) {
        VoucherEntity voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND, id));
        voucherRepository.delete(voucher);
        return voucher.getVoucherCode();
    }

    @Override
    @Transactional
    public String deleteSoft(String id) {
        VoucherEntity voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND, id));

        int affectedRows = voucherRepository.softDelete(id, LocalDateTime.now());
        if (affectedRows == 0) {
            throw new AppException(ErrorCode.VOUCHER_NOT_FOUND, id);
        }
        return voucher.getVoucherCode();
    }

    @Override
    public List<VoucherResponse> getAllInTrash() {
        return voucherRepository.findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(VoucherStatus.DELETED)
                .stream().map(voucherMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public String restore(String id) {
        VoucherEntity voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND, id));

        int affectedRows = voucherRepository.restore(id);
        if (affectedRows == 0) {
            throw new AppException(ErrorCode.VOUCHER_NOT_FOUND, id);
        }
        return voucher.getVoucherCode();
    }

    @Override
    public CheckVoucherResponse checkVoucher(CheckVoucherRequest request) {
        VoucherEntity voucher = voucherRepository.findByVoucherCode(request.getVoucherCode())
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        // 1. Kiểm tra các điều kiện hợp lệ
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new AppException(ErrorCode.VOUCHER_INACTIVE); // SỬA Ở ĐÂY
        }
        if (voucher.getStartDate().isAfter(LocalDateTime.now()) || voucher.getEndDate().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.VOUCHER_EXPIRED); // SỬA Ở ĐÂY
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new AppException(ErrorCode.VOUCHER_OUT_OF_USAGE); // SỬA Ở ĐÂY
        }
        if (request.getSubTotal().compareTo(voucher.getMinOrderValue()) < 0) {
            throw new AppException(ErrorCode.VOUCHER_CONDITION_NOT_MET); // SỬA Ở ĐÂY
        }

        // 2. Tính toán số tiền được giảm để trả về cho Frontend hiển thị
        BigDecimal discountAmount = BigDecimal.ZERO;

        switch (voucher.getType()) {
            case FREE_SHIP:
                // Lấy số tiền giảm trực tiếp từ discountValue (VD: 20.000)
                BigDecimal shipDiscount = voucher.getDiscountValue();

                // Nếu Admin có cài đặt mức giảm tối đa (> 0) thì ép xuống mức tối đa đó
                if (voucher.getMaxDiscountAmount() != null && voucher.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                    shipDiscount = shipDiscount.min(voucher.getMaxDiscountAmount());
                }

                // Số tiền giảm không bao giờ được vượt quá phí ship thực tế (30.000)
                discountAmount = request.getShippingFee().min(shipDiscount);
                break;
            case FIXED_AMOUNT:
                discountAmount = voucher.getDiscountValue();
                break;
            case PERCENTAGE:
                BigDecimal calcPercent = request.getSubTotal().multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100));
                if (voucher.getMaxDiscountAmount() != null) {
                    calcPercent = calcPercent.min(voucher.getMaxDiscountAmount());
                }
                discountAmount = calcPercent;
                break;
        }

        return CheckVoucherResponse.builder()
                .voucherId(voucher.getId())
                .voucherCode(voucher.getVoucherCode())
                .voucherName(voucher.getVoucherName())
                .type(voucher.getType())
                .discountAmount(discountAmount)
                .build();
    }

}
