package com.haui.vtech.repository;

import com.haui.vtech.entity.OrderDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetailEntity, String> {

    // KPI: Tính tổng số lượng sản phẩm rời khỏi kho (thuộc các đơn đã giao)
    @Query("SELECT SUM(od.quantity) FROM OrderDetailEntity od JOIN od.order o WHERE o.orderStatus = 'DELIVERED' AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    Long sumProductsSold(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    // TOP BÁN CHẠY: DOANH THU VÀ SỐ LƯỢNG BÁN RA
    // 1. Lấy Top sản phẩm theo Doanh thu
    @org.springframework.data.jpa.repository.Query("SELECT p.productName, SUM(od.totalPrice), SUM(od.quantity) " +
            "FROM OrderDetailEntity od JOIN od.order o JOIN ProductVariantEntity pv ON od.variantId = pv.id JOIN pv.product p " +
            "WHERE o.orderStatus = 'DELIVERED' " +
            "GROUP BY p.id, p.productName ORDER BY SUM(od.totalPrice) DESC")
    java.util.List<Object[]> getTopProductsByRevenue(org.springframework.data.domain.Pageable pageable);

    // 2. Lấy Top sản phẩm theo Số lượng bán ra
    @org.springframework.data.jpa.repository.Query("SELECT p.productName, SUM(od.totalPrice), SUM(od.quantity) " +
            "FROM OrderDetailEntity od JOIN od.order o JOIN ProductVariantEntity pv ON od.variantId = pv.id JOIN pv.product p " +
            "WHERE o.orderStatus = 'DELIVERED' " +
            "GROUP BY p.id, p.productName ORDER BY SUM(od.quantity) DESC")
    java.util.List<Object[]> getTopProductsByOrders(org.springframework.data.domain.Pageable pageable);
}