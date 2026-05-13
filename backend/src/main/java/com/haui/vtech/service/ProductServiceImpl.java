package com.haui.vtech.service;

import com.haui.vtech.dto.product.*;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
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

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_HAS_VARIANTS, product.getProductName());
        }

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

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_HAS_VARIANTS, product.getProductName());
        }

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

    @Override
    public List<ClientProductResponse> getAllClientProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE).stream().map(productMapper::toClientResponse).toList();
    }

    @Override
    public ClientProductDetailResponse getClientProductDetail(String slug) {
        ProductEntity product = productRepository.findBySlugAndStatus(slug, ProductStatus.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, "Không tìm thấy sản phẩm"));

        // 1. Lấy danh sách URL ảnh (Sắp xếp theo thứ tự hiển thị nếu có)
        List<String> imageUrls = new ArrayList<>();
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            imageUrls = product.getImages().stream()
                    .sorted((img1, img2) -> {
                        Integer order1 = img1.getDisplayOrder() != null ? img1.getDisplayOrder() : 0;
                        Integer order2 = img2.getDisplayOrder() != null ? img2.getDisplayOrder() : 0;
                        return order1.compareTo(order2);
                    })
                    .map(image -> image.getImageUrl())
                    .toList();
        }

        // 2. Xử lý Biến thể (Variants)
        List<String> versions = new ArrayList<>();
        List<ClientColorOption> colors = new ArrayList<>();
        List<ClientVariantDetailResponse> variantList = new ArrayList<>();

        BigDecimal minPrice = null;
        BigDecimal originalPriceOfMin = null;

        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            for (var v : product.getVariants()) {
                String verName = v.getVersion() != null ? v.getVersion().getVersionName() : "Tiêu chuẩn";
                String colName = v.getColor() != null ? v.getColor().getColorName() : "Mặc định";
                String colHex = v.getColor() != null ? v.getColor().getHexCode() : "#FFFFFF";

                BigDecimal salePrice = v.getSalePrice() != null ? v.getSalePrice() : v.getBasePrice();
                BigDecimal basePrice = v.getBasePrice();

                variantList.add(ClientVariantDetailResponse.builder()
                        .id(v.getId())
                        .version(verName)
                        .color(colName)
                        .price(salePrice)
                        .originalPrice(basePrice)
                        .build());

                // Gom nhóm versions (không trùng lặp)
                if (!versions.contains(verName)) {
                    versions.add(verName);
                }

                // Gom nhóm colors (không trùng lặp theo mã Hex)
                boolean colorExists = colors.stream().anyMatch(c -> c.getHex().equals(colHex));
                if (!colorExists) {
                    colors.add(ClientColorOption.builder().name(colName).hex(colHex).build());
                }

                // Tìm giá thấp nhất để làm giá mặc định
                if (minPrice == null || salePrice.compareTo(minPrice) < 0) {
                    minPrice = salePrice;
                    originalPriceOfMin = basePrice;
                }
            }
        }

        // 3. Xử lý Thông số kỹ thuật (Bây giờ nó đã là List sẵn rồi)
        List<ClientSpecOption> specOptions = new ArrayList<>();
        if (product.getSpecification() != null && product.getSpecification().getAttributes() != null) {
            product.getSpecification().getAttributes().forEach(pair -> {
                specOptions.add(ClientSpecOption.builder()
                        .label(pair.getLabel())
                        .value(pair.getValue())
                        .build());
            });
        }

        // 4. Trả về kết quả
        return ClientProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getProductName())
                .category(product.getCategory() != null ? product.getCategory().getCategoryName() : "Sản phẩm")
                .description(product.getProductDesc())
                .price(minPrice != null ? minPrice : BigDecimal.ZERO)
                .originalPrice(originalPriceOfMin != null ? originalPriceOfMin : BigDecimal.ZERO)
                .rating(product.getRatingAvg())
                .reviews(product.getTotalReviews())
                .images(imageUrls)
                .versions(versions)
                .colors(colors)
                .variantList(variantList)
                .specs(specOptions)
                .build();
    }

    @Override
    public List<ClientProductResponse> searchClientProducts(String categorySlug, String brandSlug, String tagId, BigDecimal minPrice, BigDecimal maxPrice, String sort) {
        List<ProductEntity> products = productRepository.searchClientProducts(categorySlug, brandSlug, tagId, minPrice, maxPrice);

        List<ClientProductResponse> responseList = products.stream()
                .map(productMapper::toClientResponse)
                .collect(Collectors.toList());

        // Xử lý Sắp xếp (Sorting) trên Memory
        if (sort != null) {
            switch (sort) {
                case "price-asc":
                    responseList.sort(Comparator.comparing(this::getMinPriceOfClientProduct));
                    break;
                case "price-desc":
                    responseList.sort(Comparator.comparing(this::getMinPriceOfClientProduct).reversed());
                    break;
                case "rating":
                    responseList.sort(Comparator.comparing(ClientProductResponse::getRating).reversed());
                    break;
                default: // "newest" hoặc nổi bật
                    // Mặc định lật ngược list để cái mới nhất lên đầu
                    java.util.Collections.reverse(responseList);
                    break;
            }
        }
        return responseList;
    }

    @Override
    public List<ClientProductResponse> getProductsByPromotion(String promotionId) {
        List<ProductEntity> products = productRepository.findProductsByPromotionId(promotionId);
        return products.stream()
                .map(productMapper::toClientResponse)
                .collect(Collectors.toList());
    }


    // Helper method tính giá nhỏ nhất để sort
    private BigDecimal getMinPriceOfClientProduct(ClientProductResponse p) {
        if (p.getVariants() == null || p.getVariants().isEmpty()) return BigDecimal.ZERO;
        return p.getVariants().stream().map(v -> v.getPrice()).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
    }
}
