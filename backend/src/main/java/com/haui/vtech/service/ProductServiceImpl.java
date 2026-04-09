package com.haui.vtech.service;

import com.haui.vtech.dto.product.ProductCreationRequest;
import com.haui.vtech.dto.product.ProductResponse;
import com.haui.vtech.entity.BrandEntity;
import com.haui.vtech.entity.CategoryEntity;
import com.haui.vtech.entity.ProductEntity;
import com.haui.vtech.entity.TagEntity;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.ProductMapper;
import com.haui.vtech.repository.BrandRepository;
import com.haui.vtech.repository.CategoryRepository;
import com.haui.vtech.repository.ProductRepository;
import com.haui.vtech.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final TagRepository tagRepository;
    private final ProductMapper productMapper;


    @Override
    public ProductResponse create(ProductCreationRequest request) {
        if (productRepository.existsByProductName(request.getProductName())) {
            throw new AppException(ErrorCode.PRODUCT_NAME_EXISTED, request.getProductName());
        }

        if(productRepository.existsBySlug(request.getSlug())){
            throw new AppException(ErrorCode.PRODUCT_SLUG_EXISTED, request.getSlug());
        }

        ProductEntity newProduct = productMapper.toEntity(request);

        // 1. set category
        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, request.getCategoryId()));
        newProduct.setCategory(category);
        // 2. set brand
        BrandEntity brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND, request.getBrandId()));
        newProduct.setBrand(brand);
        // 3. set tag
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<TagEntity> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));

            if (tags.size() != request.getTagIds().size()) {
                Set<String> foundIds = tags.stream().map(TagEntity::getId).collect(Collectors.toSet());

                List<String> missingIds = request.getTagIds().stream()
                        .filter(id -> !foundIds.contains(id))
                        .toList();

                throw new AppException(ErrorCode.TAG_NOT_FOUND, missingIds.toString());
            }
            newProduct.setTags(tags);
        }

        ProductEntity savedProduct = productRepository.save(newProduct);
        return productMapper.toResponse(savedProduct);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(productMapper::toResponse).collect(Collectors.toList());
    }
}
