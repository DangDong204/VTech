package com.haui.vtech.repository;

import com.haui.vtech.entity.ReviewMediaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewMediaRepository extends JpaRepository<ReviewMediaEntity, String> {

}
