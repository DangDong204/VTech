package com.haui.vtech.service;

import com.haui.vtech.dto.category.CategoryCreationRequest;
import com.haui.vtech.dto.category.CategoryResponse;
import com.haui.vtech.dto.category.CategoryTreeResponse;
import com.haui.vtech.dto.category.CategoryUpdateRequest;
import com.haui.vtech.entity.CategoryEntity;
import com.haui.vtech.enums.CategoryStatus;
import com.haui.vtech.enums.ImageFolder;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.CategoryMapper;
import com.haui.vtech.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService{

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final S3Service s3Service;

    @Override
    public CategoryResponse create(CategoryCreationRequest request, MultipartFile thumbnailUrl) {

        if(categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTED, request.getSlug());
        }

        if(request.getParentId() != null && !categoryRepository.existsById(request.getParentId())){
            throw new AppException(ErrorCode.CATEGORY_PARENT_NOT_FOUND, request.getParentId());
        }
        CategoryEntity newCategory = categoryMapper.toEntity(request);

        if (thumbnailUrl != null && !thumbnailUrl.isEmpty()) {
            String imageUrl = s3Service.uploadImage(thumbnailUrl, ImageFolder.CATEGORY);
            newCategory.setThumbnailUrl(imageUrl);
        }

        CategoryEntity savedCategory = categoryRepository.save(newCategory);

        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {

        List<CategoryEntity> categories = categoryRepository.findByStatusNot(CategoryStatus.DELETED);

        Map<String, String> categoryNameMap = categories.stream()
                .collect(Collectors.toMap(CategoryEntity::getId, CategoryEntity::getCategoryName));

        return categories.stream().map(category -> {
            CategoryResponse response = categoryMapper.toResponse(category);
            if (category.getParentId() != null) {
                response.setParentName(categoryNameMap.get(category.getParentId()));
            }
            return response;
        }).toList();
    }

    @Override
    public CategoryResponse getById(String id) {
        return categoryRepository.findById(id).map(categoryMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, id));
    }

    @Override
    public CategoryResponse update(String id, CategoryUpdateRequest request, MultipartFile thumbnailUrl) {

        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, id));

        if (!category.getSlug().equals(request.getSlug())
                && categoryRepository.existsBySlug(request.getSlug())) {
            throw new AppException(ErrorCode.CATEGORY_SLUG_EXISTED, request.getSlug());
        }

        if (request.getParentId() != null) {
            if (!categoryRepository.existsById(request.getParentId())) {
                throw new AppException(ErrorCode.CATEGORY_PARENT_NOT_FOUND, request.getParentId());
            }

            if (request.getParentId().equals(id)) {
                throw new AppException(ErrorCode.CATEGORY_PARENT_INVALID);
            }

            category.setParentId(request.getParentId());
        } else {
            category.setParentId(null);
        }

        if (thumbnailUrl != null && !thumbnailUrl.isEmpty()) {
            String imageUrl = s3Service.uploadImage(thumbnailUrl, ImageFolder.CATEGORY);
            category.setThumbnailUrl(imageUrl);
        }

        categoryMapper.updateEntity(category, request);

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public String delete(String id) {
        CategoryEntity category =  categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, id));

        if (categoryRepository.existsByParentId(id)) {
            throw new AppException(ErrorCode.CATEGORY_HAS_CHILD, category.getCategoryName());
        }

        s3Service.deleteImage(category.getThumbnailUrl());
        // TODO: logic to check if the category is used by any product

        categoryRepository.delete(category);

        return category.getCategoryName();
    }

    @Override
    @Transactional
    public String deleteSoft(String id) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, id));

        if (categoryRepository.existsByParentId(id)) {
            throw new AppException(ErrorCode.CATEGORY_HAS_CHILD, category.getCategoryName());
        }

        int affectedRows  = categoryRepository.softDelete(id, LocalDateTime.now());

        if (affectedRows  == 0) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, id);
        }

        return category.getCategoryName();
    }

    @Override
    public List<CategoryResponse> getAllInTrash() {
        return categoryRepository.findAllByStatusAndDeletedAtIsNotNullOrderByDeletedAtDesc(CategoryStatus.DELETED)
                .stream().map(categoryMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public String restore(String id) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND, id));

        int affectedRows = categoryRepository.restore(id);

        if (affectedRows == 0) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND, id);
        }

        return category.getCategoryName();
    }

    @Override
    public List<CategoryTreeResponse> getCategoryTree() {

        List<CategoryEntity> categories = categoryRepository.findAll();

        Map<String, CategoryTreeResponse> map = categories.stream()
                .collect(Collectors.toMap(
                        CategoryEntity::getId,
                        categoryMapper::toTreeResponse
                ));

        List<CategoryTreeResponse> roots = new ArrayList<>();

        for (CategoryEntity category : categories) {
            if (category.getParentId() == null) {
                roots.add(map.get(category.getId()));
            } else {
                CategoryTreeResponse parent = map.get(category.getParentId());
                if (parent != null) {
                    parent.getChildren().add(map.get(category.getId()));
                }
            }
        }

        return roots;
    }
}
