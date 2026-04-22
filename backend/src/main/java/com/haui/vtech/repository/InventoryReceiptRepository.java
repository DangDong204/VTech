package com.haui.vtech.repository;

import com.haui.vtech.entity.InventoryReceiptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryReceiptRepository extends JpaRepository<InventoryReceiptEntity, String> {
}