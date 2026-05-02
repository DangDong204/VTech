package com.haui.vtech.repository;

import com.haui.vtech.entity.VpointHistoryEntity;
import com.haui.vtech.enums.VpointTransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VpointHistoryRepository extends JpaRepository<VpointHistoryEntity, String> {

    List<VpointHistoryEntity> findByUserIdOrderByCreatedAtDesc(String userId);

    // Kiểm tra xem user này đã nhận điểm sinh nhật trong năm nay chưa
    @Query("SELECT COUNT(v) > 0 FROM VpointHistoryEntity v WHERE v.user.id = :userId AND v.transactionType = :type AND YEAR(v.createdAt) = :year")
    boolean existsBirthdayGiftThisYear(
            @Param("userId") String userId,
            @Param("type") VpointTransactionType type,
            @Param("year") int year
    );

}