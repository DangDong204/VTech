package com.haui.vtech.service;

import com.haui.vtech.dto.voucher.CheckVoucherRequest;
import com.haui.vtech.dto.voucher.CheckVoucherResponse;
import com.haui.vtech.dto.voucher.VoucherRequest;
import com.haui.vtech.dto.voucher.VoucherResponse;
import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.entity.UserVoucherEntity;
import com.haui.vtech.entity.VoucherEntity;
import com.haui.vtech.enums.VoucherStatus;
import com.haui.vtech.enums.VpointTransactionType;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.VoucherMapper;
import com.haui.vtech.repository.OrderRepository;
import com.haui.vtech.repository.UserRepository;
import com.haui.vtech.repository.UserVoucherRepository;
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
    private final UserVoucherRepository userVoucherRepository;
    private final UserRepository userRepository;
    private final VpointService vpointService;
    private final OrderRepository orderRepository;

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

        checkIfVoucherIsRemovable(voucher);

        voucherRepository.delete(voucher);
        return voucher.getVoucherCode();
    }

    @Override
    @Transactional
    public String deleteSoft(String id) {
        VoucherEntity voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND, id));

        checkIfVoucherIsRemovable(voucher);

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
        if (voucher.getRequiredPoints() != null && voucher.getRequiredPoints() > 0) {
            String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
            UserEntity currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

            // Tìm xem trong ví của user này có mã đó và chưa sử dụng không
            boolean isOwned = userVoucherRepository.findByUserIdAndVoucherIdAndIsUsedFalse(currentUser.getId(), voucher.getId()).isPresent();

            if (!isOwned) {
                throw new AppException(ErrorCode.VOUCHER_NOT_OWNED);
            }
        }

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

    @Override
    public List<VoucherResponse> getRedeemableVouchers() {
        // Trả về các Voucher đang ACTIVE, còn hạn, và CÓ YÊU CẦU ĐIỂM (> 0)
        return voucherRepository.findAll().stream()
                .filter(v -> v.getStatus() == VoucherStatus.ACTIVE)
                .filter(v -> v.getRequiredPoints() != null && v.getRequiredPoints() > 0)
                .filter(v -> v.getEndDate().isAfter(LocalDateTime.now()))
                .filter(v -> v.getUsageLimit() == null || v.getUsedCount() < v.getUsageLimit())
                .map(voucherMapper::toResponse) // Bạn nhớ map thêm trường requiredPoints vào Response nhé
                .toList();
    }

    @Override
    @Transactional
    public void redeemVoucher(String userId, String voucherId) {
        // 1. Kiểm tra User
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Kiểm tra Voucher
        VoucherEntity voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        // 3. Các lớp bảo vệ (Validation)
        if (voucher.getRequiredPoints() == null || voucher.getRequiredPoints() <= 0) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); // Mã này không dành để đổi
        }

        if (voucher.getStatus() != VoucherStatus.ACTIVE || voucher.getEndDate().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.VOUCHER_EXPIRED);
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new AppException(ErrorCode.VOUCHER_OUT_OF_USAGE); // Hết lượt phát hành
        }

        if (user.getCurrentVpoint() < voucher.getRequiredPoints()) {
            throw new AppException(ErrorCode.VPOINT_NOT_ENOUGH);
        }

        if (userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)) {
            throw new AppException(ErrorCode.VOUCHER_ALREADY_REDEEMED); // Mỗi người chỉ được đổi 1 lần mã này
        }

        // 4. THỰC THI GIAO DỊCH
        // 4.1. Trừ điểm (Gọi hàm deductPoints của vpointService)
        vpointService.deductPoints(
                userId,
                voucher.getRequiredPoints(),
                VpointTransactionType.REDEEM_VOUCHER,
                voucher.getId(),
                "Đổi điểm lấy mã giảm giá: " + voucher.getVoucherCode()
        );

        // 4.2. Ghi nhận số lượt đổi của Voucher (Tùy chọn, nếu bạn coi đổi là 1 lần usedCount)
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);

        // 4.3. Cất Voucher vào ví của User
        UserVoucherEntity userVoucher = UserVoucherEntity.builder()
                .user(user)
                .voucher(voucher)
                .isUsed(false)
                .build();
        userVoucherRepository.save(userVoucher);
    }

    @Override
    public List<VoucherResponse> getMyVouchers(String userId) {
        // 1. Lấy danh sách từ Ví (chỉ lấy mã chưa dùng)
        List<UserVoucherEntity> userVouchers = userVoucherRepository.findByUserIdAndIsUsedFalse(userId);

        // 2. Chuyển đổi và lọc các Voucher gốc hợp lệ
        return userVouchers.stream()
                .map(UserVoucherEntity::getVoucher)
                .filter(v -> v.getStatus() == VoucherStatus.ACTIVE)
                .filter(v -> v.getEndDate() == null || v.getEndDate().isAfter(LocalDateTime.now()))
                .map(voucherMapper::toResponse)
                .toList();
    }

    // Hàm dùng chung khi xoá mềm hay cứng voucher
    private void checkIfVoucherIsRemovable(VoucherEntity voucher) {
        // 1. Kiểm tra xem mã giảm giá đã nằm trong đơn hàng nào chưa
        if (orderRepository.existsByVoucherIdInOrders(voucher.getId())) {
            throw new AppException(ErrorCode.VOUCHER_USED_BY_ORDER, voucher.getVoucherCode());
        }

        // 2. Kiểm tra xem mã giảm giá có đang nằm trong ví người dùng không
        if (userVoucherRepository.existsByVoucherId(voucher.getId())) {
            throw new AppException(ErrorCode.VOUCHER_IN_USER_WALLET, voucher.getVoucherCode());
        }
    }
}
