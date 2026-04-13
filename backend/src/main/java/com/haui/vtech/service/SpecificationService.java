package com.haui.vtech.service;

import com.haui.vtech.dto.product.SpecificationRequest;
import com.haui.vtech.dto.product.SpecificationResponse;

public interface SpecificationService {

    SpecificationResponse create(String productId, SpecificationRequest request);

    SpecificationResponse getByProductId(String productId);

    SpecificationResponse update(String productId, SpecificationRequest request);

    // TODO: delete spec by productId - chưa thấy cần thiết
//    String delete(String productId);
}
