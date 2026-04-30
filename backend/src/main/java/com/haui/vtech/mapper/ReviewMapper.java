package com.haui.vtech.mapper;

import com.haui.vtech.dto.review.ReviewRequest;
import com.haui.vtech.dto.review.ReviewResponse;
import com.haui.vtech.entity.ProductVariantEntity;
import com.haui.vtech.entity.ReviewEntity;
import com.haui.vtech.entity.ReviewMediaEntity;
import com.haui.vtech.entity.ReviewReplyEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "helpfulCount", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "productVariant", ignore = true)
    @Mapping(target = "orderDetail", ignore = true)
    @Mapping(target = "mediaList", ignore = true)
    @Mapping(target = "reply", ignore = true)
    ReviewEntity toEntity(ReviewRequest request);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.avatar", target = "avatarUrl") // Đã sửa thành user.avatar
    @Mapping(source = "product.productName", target = "productName") // Thêm dòng này
    @Mapping(source = "productVariant.imageUrl", target = "productImage")
    @Mapping(source = "productVariant", target = "variantName") // Sẽ tự động gọi hàm mapVariantName ở dưới
    ReviewResponse toResponse(ReviewEntity entity);

    ReviewResponse.MediaDto toMediaDto(ReviewMediaEntity entity);

    @Mapping(source = "user.fullName", target = "adminName")
    ReviewResponse.ReplyDto toReplyDto(ReviewReplyEntity entity);

    // Custom method để ghép Tên Màu + Tên Phiên bản (VD: "Đen - 256GB")
    default String mapVariantName(ProductVariantEntity variant) {
        if (variant == null) {
            return null;
        }

        String colorName = (variant.getColor() != null && variant.getColor().getColorName() != null)
                ? variant.getColor().getColorName()
                : "";

        String versionName = (variant.getVersion() != null && variant.getVersion().getVersionName() != null)
                ? variant.getVersion().getVersionName()
                : "";

        // Nối chuỗi, nếu có cả 2 thì thêm dấu " - " ở giữa
        if (!colorName.isEmpty() && !versionName.isEmpty()) {
            return colorName + " - " + versionName;
        }

        return colorName + versionName; // Trường hợp chỉ có 1 trong 2
    }
}