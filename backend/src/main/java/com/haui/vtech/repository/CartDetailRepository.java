package com.haui.vtech.repository;

import com.haui.vtech.entity.CartDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartDetailRepository extends JpaRepository<CartDetailEntity, String> {

    Optional<CartDetailEntity> findByCartIdAndVariantId(String cartId, String variantId);

    void deleteByCartId(String cartId);
}