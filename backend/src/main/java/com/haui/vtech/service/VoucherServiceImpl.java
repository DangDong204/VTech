package com.haui.vtech.service;

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

}
