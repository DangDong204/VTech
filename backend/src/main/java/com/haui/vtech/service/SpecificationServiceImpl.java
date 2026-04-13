package com.haui.vtech.service;

import com.haui.vtech.dto.product.SpecificationRequest;
import com.haui.vtech.dto.product.SpecificationResponse;
import com.haui.vtech.entity.ProductEntity;
import com.haui.vtech.entity.SpecificationEntity;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.SpecificationMapper;
import com.haui.vtech.repository.ProductRepository;
import com.haui.vtech.repository.SpecificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SpecificationServiceImpl implements SpecificationService {

    private final SpecificationRepository specificationRepository;
    private final ProductRepository productRepository;
    private final SpecificationMapper specificationMapper;

    @Override
    public SpecificationResponse create(String productId, SpecificationRequest request) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, productId));

        if (specificationRepository.existsByProductId(productId)) {
            throw new AppException(ErrorCode.SPEC_EXISTS, product.getProductName());
        }

        SpecificationEntity spec = specificationMapper.toEntity(request);
        spec.setProduct(product);

        return specificationMapper.toResponse(specificationRepository.save(spec));
    }

    @Override
    public SpecificationResponse getByProductId(String productId) {
        SpecificationEntity spec = specificationRepository.findByProductId(productId)
                .orElseThrow(() -> new AppException(ErrorCode.SPEC_NOT_FOUND));

        return specificationMapper.toResponse(spec);
    }

    @Override
    public SpecificationResponse update(String productId, SpecificationRequest request) {
        SpecificationEntity spec = specificationRepository.findByProductId(productId)
                .orElseThrow(() -> new AppException(ErrorCode.SPEC_NOT_FOUND));

        specificationMapper.update(spec, request);

        return specificationMapper.toResponse(specificationRepository.save(spec));
    }
}
