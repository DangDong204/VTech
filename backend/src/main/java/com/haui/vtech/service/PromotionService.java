package com.haui.vtech.service;

import com.haui.vtech.dto.promotion.PromotionRequest;
import com.haui.vtech.dto.promotion.PromotionResponse;

import java.util.List;

public interface PromotionService {

    PromotionResponse create(PromotionRequest request);

    List<PromotionResponse> getAllPromotions();

    PromotionResponse getById(String id);

    PromotionResponse update(String id, PromotionRequest request);

    String deleteHard(String id);

    String deleteSoft(String id);

    List<PromotionResponse> getAllInTrash();

    String restore(String id);
}
