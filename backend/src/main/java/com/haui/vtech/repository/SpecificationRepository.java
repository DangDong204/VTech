package com.haui.vtech.repository;

import com.haui.vtech.entity.SpecificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecificationRepository extends JpaRepository<SpecificationEntity, String> {

    Optional<SpecificationEntity> findByProductId(String productId);

    boolean existsByProductId(String productId);
}
