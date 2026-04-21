package com.haui.vtech.repository;

import com.haui.vtech.entity.VoucherEntity;
import com.haui.vtech.enums.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<VoucherEntity, String> {
    boolean existsByVoucherCode(String code);

    List<VoucherEntity> findByStatusNot(VoucherStatus status);

    @Modifying
    @Query("""
        update VoucherEntity v
        set v.status = 'DELETED',
            v.deletedAt = :deletedAt
        where v.id = :id
          and v.deletedAt is null
    """)
    int softDelete(
            @Param("id") String id,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    @Modifying
    @Query("""
        update VoucherEntity v
        set v.status = 'ACTIVE',
            v.deletedAt = null
        where v.id = :id
          and v.deletedAt is not null
    """)
    int restore(@Param("id") String id);

    List<VoucherEntity> findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(VoucherStatus status);
}
