package com.haui.vtech.service;

import com.haui.vtech.dto.product.ProductImageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {

    void uploadProductImage(String productId, MultipartFile thumbnail, List<MultipartFile> images);

    // TODO: thêm các method khác như xóa ảnh, lấy ảnh theo productId, ...

    ProductImageResponse getProductImages(String productId);

}
