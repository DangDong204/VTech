package com.haui.vtech.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(999, "uncategorized.exception", HttpStatus.INTERNAL_SERVER_ERROR),
    KEY_INVALID(998, "key.invalid", HttpStatus.BAD_REQUEST),

    EMAIL_EXSISTED(1001, "email.exists", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_EXSISTED(1002, "email.not.existed", HttpStatus.NOT_FOUND),
    EMAIL_NOTBLANK(1003, "email.not.blank", HttpStatus.BAD_REQUEST),
    EMAIL_VALID(1004, "email.valid", HttpStatus.BAD_REQUEST),
    BAD_CREDENTIALS(1005, "auth.bad.credentials", HttpStatus.UNAUTHORIZED),

    USERNAME_NOTBLANK(2001, "username.not.blank", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(2002, "password.invalid", HttpStatus.BAD_REQUEST),
    PASSWORD_NOTBLANK(2003, "password.not.blank", HttpStatus.BAD_REQUEST),

    OLD_PASSWORD_NOTBLANK(2004, "password.old.not.blank", HttpStatus.BAD_REQUEST),
    NEW_PASSWORD_NOTBLANK(2005, "password.new.not.blank", HttpStatus.BAD_REQUEST),
    OLD_PASSWORD_INVALID(2006, "password.old.invalid", HttpStatus.BAD_REQUEST),
    NEW_PASSWORD_SAME_AS_OLD(2007, "password.new.same.old", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(401, "unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(403, "unauthorized", HttpStatus.FORBIDDEN),

    ROLE_NOT_FOUND(3000, "role.not.found", HttpStatus.BAD_REQUEST),

    USER_NOT_FOUND(4001, "user.not.found", HttpStatus.NOT_FOUND),
    CANNOT_DELETE_SELF(4002, "user.cannot.delete.self", HttpStatus.BAD_REQUEST),

    CATEGORY_NOT_FOUND(5000, "category.not.found", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_NOTBLANK(5001, "category.name.not.blank", HttpStatus.BAD_REQUEST),
    CATEGORY_SLUG_NOTBLANK(5002, "category.slug.not.blank", HttpStatus.BAD_REQUEST),
    CATEGORY_SLUG_EXISTED(5003, "category.slug.exists", HttpStatus.BAD_REQUEST),
    CATEGORY_PARENT_NOT_FOUND(5004, "category.parent.not.found", HttpStatus.BAD_REQUEST),
    CATEGORY_PARENT_INVALID(5005, "category.parent.invalid", HttpStatus.BAD_REQUEST),
    CATEGORY_HAS_CHILD(5006, "category.has.child", HttpStatus.BAD_REQUEST),
    CATEGORY_USED_BY_PRODUCT(5007, "category.used.by.product", HttpStatus.BAD_REQUEST),

    BRAND_NOT_FOUND(5007, "brand.not.found", HttpStatus.NOT_FOUND),
    BRAND_NAME_NOTBLANK(5008, "brand.name.not.blank", HttpStatus.BAD_REQUEST),
    BRAND_SLUG_NOTBLANK(5009, "brand.slug.not.blank", HttpStatus.BAD_REQUEST),
    BRAND_SLUG_EXISTED(5010, "brand.slug.exists", HttpStatus.BAD_REQUEST),
    BRAND_USED_BY_PRODUCT(5011, "brand.used.by.product", HttpStatus.BAD_REQUEST),

    FILE_TYPE_INVALID(6000, "file.type.invalid", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE(6001, "file.too.large", HttpStatus.BAD_REQUEST),
    UPLOAD_IMAGE_FAILED(6002, "upload.image.failed", HttpStatus.INTERNAL_SERVER_ERROR),
    DELETE_IMAGE_FAILED(6003, "delete.image.failed", HttpStatus.INTERNAL_SERVER_ERROR),
    IMAGE_NOT_FOUND(6004, "image.not.found", HttpStatus.NOT_FOUND),

    TAG_NOT_FOUND(6010, "tag.not.found", HttpStatus.NOT_FOUND),
    TAG_NAME_NOTBLANK(6011, "tag.name.not.blank", HttpStatus.BAD_REQUEST),
    TAG_NAME_EXISTS(6012, "tag.name.exists", HttpStatus.BAD_REQUEST),
    TAG_NAME_MAX(6013, "tag.name.max", HttpStatus.BAD_REQUEST),
    TAG_DESC_MAX(6014, "tag.desc.max", HttpStatus.BAD_REQUEST),
    TAG_IN_USE(6015, "tag.in.use", HttpStatus.BAD_REQUEST),

    PRODUCT_NOT_FOUND(7000, "product.not.found", HttpStatus.NOT_FOUND),
    PRODUCT_NAME_NOTBLANK(7001, "product.name.not.blank", HttpStatus.BAD_REQUEST),
    PRODUCT_NAME_EXISTED(7002, "product.name.exists", HttpStatus.BAD_REQUEST),
    PRODUCT_SLUG_NOTBLANK(7002, "product.slug.not.blank", HttpStatus.BAD_REQUEST),
    PRODUCT_SLUG_EXISTED(7003, "product.slug.exists", HttpStatus.BAD_REQUEST),

    COLOR_NOT_FOUND(7100, "color.not.found", HttpStatus.NOT_FOUND),
    COLOR_ID_NOTBLANK(7101, "color.id.not.blank", HttpStatus.BAD_REQUEST),
    COLOR_NAME_NOTBLANK(7102, "color.name.not.blank", HttpStatus.BAD_REQUEST),
    COLOR_USED_BY_VARIANT(7103, "color.used.by.variant", HttpStatus.BAD_REQUEST),

    VERSION_NOT_FOUND(7200, "version.not.found", HttpStatus.NOT_FOUND),
    VERSION_ID_NOTBLANK(7201, "version.id.not.blank", HttpStatus.BAD_REQUEST),
    VERSION_NAME_NOTBLANK(7202, "version.name.not.blank", HttpStatus.BAD_REQUEST),
    VERSION_USED_BY_VARIANT(7203, "version.used.by.variant", HttpStatus.BAD_REQUEST),

    SKU_EXISTED(7300, "product.variant.sku.exists", HttpStatus.BAD_REQUEST),
    VARIANT_EXISTED(7301, "product.variant.exists", HttpStatus.BAD_REQUEST),
    VARIANT_NOT_FOUND(7302, "product.variant.not.found", HttpStatus.NOT_FOUND),

    PRODUCT_ID_NOTBLANK(7302, "product.id.not.blank", HttpStatus.BAD_REQUEST),
    VARIANT_SKU_NOTBLANK(7303, "product.variant.sku.not.blank", HttpStatus.BAD_REQUEST),
    BASE_PRICE_NOTNULL(7304, "product.variant.price.not.null", HttpStatus.BAD_REQUEST),
    BASE_PRICE_MIN(7305, "product.variant.price.min", HttpStatus.BAD_REQUEST),

    SPEC_EXISTS(8000, "specification.exists", HttpStatus.BAD_REQUEST),
    SPEC_NOT_FOUND(8001, "specification.not.found", HttpStatus.NOT_FOUND),

    VOUCHER_NOT_FOUND(9000, "voucher.not.found", HttpStatus.NOT_FOUND),
    VOUCHER_CODE_NOTBLANK(9001, "voucher.code.not.blank", HttpStatus.BAD_REQUEST),
    VOUCHER_CODE_EXISTED(9002, "voucher.code.exists", HttpStatus.BAD_REQUEST),
    VOUCHER_NAME_NOTBLANK(9003, "voucher.name.not.blank", HttpStatus.BAD_REQUEST),
    VOUCHER_TYPE_INVALID(9004, "voucher.type.invalid", HttpStatus.BAD_REQUEST),
    VOUCHER_VALUE_INVALID(9005, "voucher.value.invalid", HttpStatus.BAD_REQUEST),
    VOUCHER_MIN_ORDER_INVALID(9006, "voucher.min.order.invalid", HttpStatus.BAD_REQUEST),
    VOUCHER_DATES_INVALID(9007, "voucher.dates.invalid", HttpStatus.BAD_REQUEST),

    PROMOTION_NOT_FOUND(10000, "promotion.not.found", HttpStatus.NOT_FOUND),
    PROMOTION_NAME_NOTBLANK(10001, "promotion.name.not.blank", HttpStatus.BAD_REQUEST),
    PROMOTION_TYPE_INVALID(10002, "promotion.type.invalid", HttpStatus.BAD_REQUEST),
    PROMOTION_VALUE_INVALID(10003, "promotion.value.invalid", HttpStatus.BAD_REQUEST),
    PROMOTION_DATES_INVALID(10004, "promotion.dates.invalid", HttpStatus.BAD_REQUEST),
    PROMOTION_IN_USE(10005, "promotion.in.use", HttpStatus.BAD_REQUEST),
    PROMOTION_NAME_EXISTED(10006, "promotion.name.exists", HttpStatus.BAD_REQUEST),

    SUPPLIER_NOT_FOUND(11000, "supplier.not.found", HttpStatus.NOT_FOUND),
    RECEIPT_NOT_FOUND(11001, "receipt.not.found", HttpStatus.NOT_FOUND),
    RECEIPT_NOT_PENDING(11002, "receipt.not.pending", HttpStatus.BAD_REQUEST),
    EXCEL_INVALID_FORMAT(11003, "excel.invalid.format", HttpStatus.BAD_REQUEST),
    EXCEL_READ_ERROR(11004, "excel.read.error", HttpStatus.INTERNAL_SERVER_ERROR),
    RECEIPT_DETAIL_EMPTY(110005, "receipt.detail.empty", HttpStatus.BAD_REQUEST),

    CART_NOT_FOUND(12000, "cart.not.found", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_FOUND(12001, "cart.item.not.found", HttpStatus.NOT_FOUND),
    OUT_OF_STOCK(12002, "product.out.of.stock", HttpStatus.BAD_REQUEST),

    ADDRESS_NOT_FOUND(13000, "address.not.found", HttpStatus.NOT_FOUND),

    ORDER_NOT_FOUND(14000, "order.not.found", HttpStatus.NOT_FOUND),
    EMPTY_ORDER_ITEMS(14001, "order.items.empty", HttpStatus.BAD_REQUEST),
    ORDER_STATUS_INVALID(14002, "order.status.invalid", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_CANCEL(14003, "order.cannot.cancel", HttpStatus.BAD_REQUEST),
    ORDER_TRANSITION_INVALID(14004, "order.transition.invalid", HttpStatus.BAD_REQUEST),
    ORDER_NOT_SHIPPING(14005, "order.not.shipping", HttpStatus.BAD_REQUEST),
    ORDER_NOT_DELIVERED(14006, "order.not.delivered", HttpStatus.BAD_REQUEST),
    ORDER_RETURN_EXPIRED(14007, "order.return.expired", HttpStatus.BAD_REQUEST)
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;
}
