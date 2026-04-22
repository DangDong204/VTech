package com.haui.vtech.repository;

import com.haui.vtech.entity.SupplierEntity;
import com.haui.vtech.enums.SupplierStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<SupplierEntity, String> {

    List<SupplierEntity> findByStatus(SupplierStatus status);
}