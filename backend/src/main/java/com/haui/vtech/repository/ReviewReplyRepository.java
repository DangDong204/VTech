package com.haui.vtech.repository;

import com.haui.vtech.entity.ReviewReplyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReplyEntity, String> {

    boolean existsByReviewId(String reviewId);

}
