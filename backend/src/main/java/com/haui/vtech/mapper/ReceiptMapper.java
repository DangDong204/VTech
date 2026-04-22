package com.haui.vtech.mapper;

import com.haui.vtech.dto.receipt.ReceiptDetailResponse;
import com.haui.vtech.dto.receipt.ReceiptResponse;
import com.haui.vtech.dto.receipt.SupplierResponse;
import com.haui.vtech.entity.InventoryReceiptDetailEntity;
import com.haui.vtech.entity.InventoryReceiptEntity;
import com.haui.vtech.entity.SupplierEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReceiptMapper {

    SupplierResponse toSupplierResponse(SupplierEntity entity);

    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierName", source = "supplier.supplierName")
    ReceiptResponse toResponse(InventoryReceiptEntity entity);

    @Mapping(target = "variantId", source = "variant.id")
    @Mapping(target = "sku", source = "variant.sku")
    @Mapping(target = "productName", source = "variant.product.productName")
    @Mapping(target = "versionName", source = "variant.version.versionName")
    @Mapping(target = "colorName", source = "variant.color.colorName")
    ReceiptDetailResponse toDetailResponse(InventoryReceiptDetailEntity entity);
}