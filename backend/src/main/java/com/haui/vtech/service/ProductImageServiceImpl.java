package com.haui.vtech.service;

import com.haui.vtech.dto.product.ProductImageResponse;
import com.haui.vtech.entity.ProductEntity;
import com.haui.vtech.entity.ProductImageEntity;
import com.haui.vtech.enums.ImageFolder;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.repository.ProductImageRepository;
import com.haui.vtech.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final S3Service s3Service;

    @Override
    @Transactional
    public void uploadProductImage(String productId, MultipartFile thumbnail, List<MultipartFile> images) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, productId));

        // 🔥 1. xử lý thumbnail
        if (thumbnail != null && !thumbnail.isEmpty()) {

            ProductImageEntity oldThumbnail =
                    productImageRepository.findByProductIdAndIsThumbnailTrue(productId);

            if (oldThumbnail != null) {
                s3Service.deleteImage(oldThumbnail.getImageUrl());

                productImageRepository.delete(oldThumbnail);
            }

            String thumbnailUrl = s3Service.uploadImage(thumbnail, ImageFolder.PRODUCT, product.getSlug());

            ProductImageEntity thumbnailEntity = ProductImageEntity.builder()
                    .product(product)
                    .imageUrl(thumbnailUrl)
                    .isThumbnail(true)
                    .displayOrder(0)
                    .build();

            productImageRepository.save(thumbnailEntity);
        }

        // 🔥 2. xử lý gallery
        if (images != null && !images.isEmpty()) {

            List<ProductImageEntity> existingImages =
                    productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);

            int maxOrder = existingImages.stream()
                    .filter(img -> !Boolean.TRUE.equals(img.getIsThumbnail()))
                    .mapToInt(ProductImageEntity::getDisplayOrder).max().orElse(0);

            int order = maxOrder + 1;

            for (MultipartFile file : images) {
                String url = s3Service.uploadImage(file, ImageFolder.PRODUCT, product.getSlug());

                ProductImageEntity image = ProductImageEntity.builder()
                        .product(product)
                        .imageUrl(url)
                        .isThumbnail(false)
                        .displayOrder(order++)
                        .build();

                productImageRepository.save(image);
            }
        }
    }

    @Override
    public ProductImageResponse getProductImages(String productId) {
        if (!productRepository.existsById(productId)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, productId);
        }

        List<ProductImageEntity> images =
                productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);

        String thumbnail = null;

        List<String> gallery = images.stream()
                .filter(img -> !Boolean.TRUE.equals(img.getIsThumbnail()))
                .map(ProductImageEntity::getImageUrl)
                .toList();

        // lấy thumbnail
        for (ProductImageEntity img : images) {
            if (Boolean.TRUE.equals(img.getIsThumbnail())) {
                thumbnail = img.getImageUrl();
                break;
            }
        }

        return ProductImageResponse.builder()
                .thumbnail(thumbnail)
                .images(gallery)
                .build();
    }

    @Override
    public void deleteProductImage(String productId, String imageUrl) {
        List<ProductImageEntity> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);

        ProductImageEntity targetImage = images.stream()
                .filter(img -> img.getImageUrl().equals(imageUrl))
                .findFirst().orElseThrow(() -> new AppException(ErrorCode.IMAGE_NOT_FOUND, imageUrl));

        s3Service.deleteImage(targetImage.getImageUrl());

        productImageRepository.delete(targetImage);
    }
}
