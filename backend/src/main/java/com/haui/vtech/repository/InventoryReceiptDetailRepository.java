package com.haui.vtech.repository;

import com.haui.vtech.entity.InventoryReceiptDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryReceiptDetailRepository extends JpaRepository<InventoryReceiptDetailEntity, String> {
    // Chú ý: Vì trong entity bạn đặt tên trường là 'variant', nên Spring Data JPA sẽ truy xuất ID thông qua 'Variant_Id'
    boolean existsByVariant_Id(String variantId);
}