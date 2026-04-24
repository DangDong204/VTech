package com.haui.vtech.dto.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class ClientProductDetailResponse {
    private String id;
    private String name;
    private String category;
    private String description;

    // Giá hiển thị mặc định khi vừa vào trang
    private BigDecimal price;
    private BigDecimal originalPrice;

    private BigDecimal rating;
    private Integer reviews;

    private List<String> images; // Danh sách URL ảnh (Gallery)

    private List<String> versions;
    private List<ClientColorOption> colors;

    // Mảng các biến thể để Frontend tra cứu giá khi người dùng bấm chọn
    private List<ClientVariantDetailResponse> variantList;

    // Thông số kỹ thuật
    private List<ClientSpecOption> specs;
}