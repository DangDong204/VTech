package com.haui.vtech.service;

import com.haui.vtech.dto.product.ProductVariantRequest;
import com.haui.vtech.dto.product.ProductVariantResponse;
import com.haui.vtech.entity.ColorEntity;
import com.haui.vtech.entity.ProductEntity;
import com.haui.vtech.entity.ProductVariantEntity;
import com.haui.vtech.entity.VersionEntity;
import com.haui.vtech.enums.ImageFolder;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.mapper.ProductVariantMapper;
import com.haui.vtech.repository.ColorRepository;
import com.haui.vtech.repository.ProductRepository;
import com.haui.vtech.repository.ProductVariantRepository;
import com.haui.vtech.repository.VersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final ColorRepository colorRepository;
    private final VersionRepository versionRepository;
    private final ProductVariantMapper variantMapper;
    private final S3Service s3Service;

    @Override
    public ProductVariantResponse create(ProductVariantRequest request, MultipartFile image) {
        if (variantRepository.existsBySku(request.getSku())) {
            throw new AppException(ErrorCode.SKU_EXISTED, request.getSku());
        }

        if (variantRepository.existsByProductIdAndColorIdAndVersionId(
                request.getProductId(), request.getColorId(), request.getVersionId())) {
            throw new AppException(ErrorCode.VARIANT_EXISTED);
        }

        ProductVariantEntity entity = variantMapper.toEntity(request);
        setVariantRelations(entity, request);

        if (image != null && !image.isEmpty()) {
            // Lưu ý: Đổi ImageFolder.PRODUCT thành Enum tương ứng trong dự án của bạn
            String imageUrl = s3Service.uploadImage(image, ImageFolder.PRODUCT, "variants");
            entity.setImageUrl(imageUrl);
        }

        return variantMapper.toResponse(variantRepository.save(entity));

    }

    @Override
    public List<ProductVariantResponse> getByProductId(String productId) {
        if (!productRepository.existsById(productId)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND, productId);
        }
        return variantRepository.findByProductId(productId).stream().map(variantMapper::toResponse).toList();
    }

    @Override
    public ProductVariantResponse getById(String id) {
        return variantRepository.findById(id)
                .map(variantMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, id));
    }

    @Override
    public ProductVariantResponse update(String id, ProductVariantRequest request, MultipartFile image) {
        ProductVariantEntity entity = variantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, id));

        // Kiểm tra SKU trùng lặp nếu đổi sang SKU mới
        if (!entity.getSku().equals(request.getSku()) && variantRepository.existsBySku(request.getSku())) {
            throw new AppException(ErrorCode.SKU_EXISTED, request.getSku());
        }

        // Kiểm tra trùng lặp tổ hợp (Sản phẩm - Màu - Phiên bản) nếu có sự thay đổi
        boolean isCombinationChanged = !entity.getColor().getId().equals(request.getColorId()) ||
                !entity.getVersion().getId().equals(request.getVersionId());

        if (isCombinationChanged && variantRepository.existsByProductIdAndColorIdAndVersionId(
                request.getProductId(), request.getColorId(), request.getVersionId())) {
            throw new AppException(ErrorCode.VARIANT_EXISTED);
        }

        variantMapper.updateEntity(entity, request);
        setVariantRelations(entity, request);

        if (image != null && !image.isEmpty()) {
            if (entity.getImageUrl() != null) {
                s3Service.deleteImage(entity.getImageUrl());
            }
            String imageUrl = s3Service.uploadImage(image, ImageFolder.PRODUCT, "variants");
            entity.setImageUrl(imageUrl);
        }

        return variantMapper.toResponse(variantRepository.save(entity));
    }

    @Override
    public String delete(String id) {
        ProductVariantEntity entity = variantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, id));

        // XÓA ẢNH TRÊN S3 TRƯỚC KHI XÓA RECORD
        if (entity.getImageUrl() != null) {
            s3Service.deleteImage(entity.getImageUrl());
        }

        String sku = entity.getSku();
        variantRepository.delete(entity);
        return sku;
    }

    // Helper method để map các quan hệ ManyToOne
    private void setVariantRelations(ProductVariantEntity entity, ProductVariantRequest request) {
        ProductEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, request.getProductId()));

        ColorEntity color = colorRepository.findById(request.getColorId())
                .orElseThrow(() -> new AppException(ErrorCode.COLOR_NOT_FOUND, request.getColorId()));

        VersionEntity version = versionRepository.findById(request.getVersionId())
                .orElseThrow(() -> new AppException(ErrorCode.VERSION_NOT_FOUND, request.getVersionId()));

        entity.setProduct(product);
        entity.setColor(color);
        entity.setVersion(version);
    }
}
