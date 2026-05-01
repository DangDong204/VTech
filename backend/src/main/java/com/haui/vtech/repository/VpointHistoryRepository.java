package com.haui.vtech.repository;

import com.haui.vtech.entity.VpointHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VpointHistoryRepository extends JpaRepository<VpointHistoryEntity, String> {

    List<VpointHistoryEntity> findByUserIdOrderByCreatedAtDesc(String userId);

}