package com.haui.vtech.repository;

import com.haui.vtech.entity.UserAddressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddressEntity, String> {

    List<UserAddressEntity> findByUserIdOrderByIsDefaultDescCreatedAtDesc(String userId);

    Optional<UserAddressEntity> findByIdAndUserId(String id, String userId);

    long countByUserId(String userId);

    @Modifying
    @Query("UPDATE UserAddressEntity a " +
            "SET a.isDefault = false " +
            "WHERE a.userId = :userId AND a.isDefault = true")
    void clearDefaultAddress(@Param("userId") String userId);
}