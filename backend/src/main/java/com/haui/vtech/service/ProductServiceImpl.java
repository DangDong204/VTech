package com.haui.vtech.service;

import com.haui.vtech.dto.product.ProductCreationRequest;
import com.haui.vtech.dto.product.ProductResponse;
import com.haui.vtech.dto.product.ProductUpdateRequest;
import com.haui.vtech.entity.BrandEntity;
import com.haui.vtech.entity.CategoryEntity;
import com.haui.vtech.entity.ProductEntity;
import com.haui.vtech.entity.TagEntity;
import com.haui.vtech.enums.ProductStatus;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.ProductMapper;
import com.haui.vtech.repository.BrandRepository;
import com.haui.vtech.repository.CategoryRepository;
import com.haui.vtech.repository.ProductRepository;
import com.haui.vtech.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final S3Service s3Service;


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
        return productRepository.findByStatusNot(ProductStatus.DELETED).stream().map(productMapper::toResponse).toList();
    }

    @Override
    public ProductResponse getById(String id) {
        return productRepository.findById(id).map(productMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, id));
    }

    @Override
    public ProductResponse update(String id, ProductUpdateRequest request) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, id));

        if (productRepository.existsByProductName(request.getProductName())
                && !product.getProductName().equals(request.getProductName())) {
            throw new AppException(ErrorCode.PRODUCT_NAME_EXISTED, request.getProductName());
        }

        if (productRepository.existsBySlug(request.getSlug())
                && !product.getSlug().equals(request.getSlug())) {
            throw new AppException(ErrorCode.PRODUCT_SLUG_EXISTED, request.getSlug());
        }

        productMapper.updateEntity(product, request);

        // 1. set category nếu có
        if (request.getCategoryId() != null) {
            CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, request.getCategoryId()));
            product.setCategory(category);
        }

        // 2. set brand nếu có
        if (request.getBrandId() != null) {
            BrandEntity brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND, request.getBrandId()));
            product.setBrand(brand);
        }

        // 3. update tags
        if (request.getTagIds() != null) {

            Set<TagEntity> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));

            if (tags.size() != request.getTagIds().size()) {
                Set<String> foundIds = tags.stream().map(TagEntity::getId).collect(Collectors.toSet());

                List<String> missingIds = request.getTagIds().stream()
                        .filter(tagId -> !foundIds.contains(tagId))
                        .toList();

                throw new AppException(ErrorCode.TAG_NOT_FOUND, missingIds.toString());
            }

            // clear old
            product.getTags().forEach(tag -> tag.getProducts().remove(product));
            product.getTags().clear();

            // add new
            tags.forEach(product::addTag);
        }

        ProductEntity updatedProduct = productRepository.save(product);
        return productMapper.toResponse(updatedProduct);
    }

    @Override
    public String delete(String id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, id));

        if (product.getImages() != null && !product.getImages().isEmpty()) {
            product.getImages().forEach(image -> {
                s3Service.deleteImage(image.getImageUrl());
            });
        }

        productRepository.delete(product);
        return product.getProductName();
    }

    @Override
    @Transactional
    public String deleteSoft(String id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, id));

        int affectedRows = productRepository.softDelete(id, LocalDateTime.now());

        if(affectedRows == 0) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, id);
        }

        return product.getProductName();
    }

    @Override
    public List<ProductResponse> getAllInTrash() {
        return productRepository.findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(ProductStatus.DELETED)
                .stream().map(productMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public String restore(String id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, id));

        int affectedRows = productRepository.restore(id);

        if(affectedRows == 0) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, id);
        }

        return product.getProductName();
    }

    @Override
    public List<ProductResponse> getProductsByTag(String tagId) {
        TagEntity tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new AppException(ErrorCode.TAG_NOT_FOUND, tagId));

        return productRepository.findByTags_IdAndStatus(tagId, ProductStatus.ACTIVE)
                .stream().map(productMapper::toResponse).toList();
    }

    @Override
    public List<ProductResponse> getProductsByCategory(String categoryId) {
        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, categoryId));

        return productRepository.findByCategoryIdAndStatus(categoryId, ProductStatus.ACTIVE)
                .stream().map(productMapper::toResponse).toList();
    }

    @Override
    public List<ProductResponse> getProductsByBrand(String brandId) {
        BrandEntity brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_FOUND, brandId));

        return productRepository.findByBrandIdAndStatus(brandId, ProductStatus.ACTIVE)
                .stream().map(productMapper::toResponse).toList();
    }
}
