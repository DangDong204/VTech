package com.haui.vtech.repository;

import com.haui.vtech.entity.UserVoucherEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucherEntity, String> {
    // Lấy ví voucher của user (chỉ lấy các mã chưa dùng)
    List<UserVoucherEntity> findByUserIdAndIsUsedFalse(String userId);

    // Kiểm tra xem user đã sở hữu voucher này chưa (chống đổi 1 mã nhiều lần)
    boolean existsByUserIdAndVoucherId(String userId, String voucherId);

    // Tìm voucher trong ví để gạch thẻ lúc thanh toán
    Optional<UserVoucherEntity> findByUserIdAndVoucherIdAndIsUsedFalse(String userId, String voucherId);
}