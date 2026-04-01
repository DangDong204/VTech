package com.haui.vtech.repository;

import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    boolean existsByEmail(String email);

    Optional<UserEntity> findByEmail(String email);

    List<UserEntity> findByStatusNot(UserStatus status);

    List<UserEntity> findAllByStatusAndDeletedAtBefore(
            UserStatus status,
            LocalDateTime time
    );

    @Modifying
    @Query("""
        update UserEntity u
        set u.status = DELETED,
            u.deletedAt = :deletedAt
        where u.id = :id
          and u.deletedAt is null
    """)
    int softDelete(
            @Param("id") String id,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    @Modifying
    @Query("""
        update UserEntity u
        set u.status = ACTIVE,
            u.deletedAt = null
        where u.id = :id
          and u.deletedAt is not null
    """)
    int restore(@Param("id") String id);

    List<UserEntity> findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(UserStatus status);
}
