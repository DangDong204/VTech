package com.haui.vtech.repository;

import com.haui.vtech.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, String> {

    // Lấy danh sách đơn hàng của một user, sắp xếp mới nhất lên đầu
    List<OrderEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    // Lấy chi tiết 1 đơn hàng đảm bảo thuộc về user đó (tránh lỗi bảo mật IDOR)
    Optional<OrderEntity> findByIdAndUserId(String id, String userId);

    List<OrderEntity> findAllByOrderByCreatedAtDesc();

    // Phục vụ - VNPay: tìm đơn hàng theo mã đơn hàng (orderCode)
    Optional<OrderEntity> findByOrderCode(String orderCode);

    // Tìm đơn hàng chưa xác nhận quá thời hạn (Ví dụ 15 phút = 900 giây)
    @Query("SELECT o FROM OrderEntity o WHERE o.orderStatus = 'PENDING' " +
            "AND o.paymentMethod = 'VNPAY' " +
            "AND o.createdAt < :timeoutLimit")
    List<OrderEntity> findAbandonedVnPayOrders(@org.springframework.data.repository.query.Param("timeoutLimit") java.time.LocalDateTime timeoutLimit);
}