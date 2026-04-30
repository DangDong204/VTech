package com.haui.vtech.repository;

import com.haui.vtech.entity.ReviewEntity;
import com.haui.vtech.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, String> {

    boolean existsByOrderDetailId(String orderDetailId);

    // 1. DÀNH CHO ADMIN: Lấy tất cả review, mới nhất (ID lớn nhất) lên đầu
    List<ReviewEntity> findAllByOrderByIdDesc();

    // 2. DÀNH CHO CLIENT: Lấy review của 1 sản phẩm cụ thể theo trạng thái, mới nhất lên đầu
    List<ReviewEntity> findByProductIdAndStatusOrderByIdDesc(String productId, ReviewStatus status);
}