package com.haui.vtech.service;

import com.haui.vtech.dto.cart.CartItemRequest;
import com.haui.vtech.dto.cart.CartItemResponse;
import com.haui.vtech.dto.cart.CartResponse;
import com.haui.vtech.entity.CartDetailEntity;
import com.haui.vtech.entity.CartEntity;
import com.haui.vtech.entity.ProductImageEntity;
import com.haui.vtech.entity.ProductVariantEntity;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.repository.CartDetailRepository;
import com.haui.vtech.repository.CartRepository;
import com.haui.vtech.repository.ProductVariantRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartDetailRepository cartDetailRepository;
    private final ProductVariantRepository variantRepository; // Inject Repository này

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getMyCart(String userId) {
        CartEntity cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null || cart.getCartDetails().isEmpty()) {
            return CartResponse.builder().totalCartValue(BigDecimal.ZERO).totalQuantity(0).build();
        }
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(String userId, CartItemRequest request) {
        // 1. Kiểm tra Variant tồn tại và đủ số lượng không
        ProductVariantEntity variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, request.getVariantId()));

        CartEntity cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(CartEntity.builder().userId(userId).build()));

        CartDetailEntity detail = cartDetailRepository.findByCartIdAndVariantId(cart.getId(), request.getVariantId())
                .orElse(null);

        int currentQtyInCart = detail != null ? detail.getQuantity() : 0;
        int newTotalQty = currentQtyInCart + request.getQuantity();

        // 2. Ném Exception nếu vượt quá Stock
        if (newTotalQty > variant.getStockQuantity()) {
            throw new AppException(ErrorCode.OUT_OF_STOCK, String.valueOf(variant.getStockQuantity()));
        }

        if (detail != null) {
            detail.setQuantity(newTotalQty);
            cartDetailRepository.save(detail);
        } else {
            CartDetailEntity newDetail = CartDetailEntity.builder()
                    .cart(cart)
                    .variantId(request.getVariantId())
                    .quantity(request.getQuantity())
                    .build();

            cart.getCartDetails().add(newDetail);
            cartRepository.save(cart);
        }

        entityManager.flush();
        entityManager.clear();

        return getMyCart(userId);
    }

    @Override
    @Transactional
    public CartResponse updateQuantity(String userId, String cartDetailId, Integer quantity) {
        CartDetailEntity detail = cartDetailRepository.findById(cartDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        // 1. Kiểm tra tồn kho
        ProductVariantEntity variant = variantRepository.findById(detail.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, detail.getVariantId()));

        if (quantity > variant.getStockQuantity()) {
            throw new AppException(ErrorCode.OUT_OF_STOCK, String.valueOf(variant.getStockQuantity()));
        }

        detail.setQuantity(quantity);
        cartDetailRepository.save(detail);

        entityManager.flush();
        entityManager.clear();

        return getMyCart(userId);
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(String userId, String cartDetailId) {
        CartEntity cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        boolean removed = cart.getCartDetails().removeIf(detail -> detail.getId().equals(cartDetailId));

        if (!removed) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        cartRepository.save(cart);

        entityManager.flush();
        entityManager.clear();

        return getMyCart(userId);
    }

    @Override
    @Transactional
    public void clearCart(String userId) {
        CartEntity cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart != null) {
            cartDetailRepository.deleteByCartId(cart.getId());
        }
    }

    // --- HÀM MAPPER NỘI BỘ VỚI DỮ LIỆU THỰC ---
    private CartResponse mapToCartResponse(CartEntity cart) {
        BigDecimal totalValue = BigDecimal.ZERO;
        int totalQty = 0;

        List<CartItemResponse> items = cart.getCartDetails().stream().map(detail -> {

            // Lấy thông tin thật từ DB
            ProductVariantEntity variant = variantRepository.findById(detail.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, detail.getVariantId()));

            BigDecimal price = variant.getSalePrice();
            BigDecimal originalPrice = variant.getBasePrice(); // Lấy giá gốc
            Integer stockQuantity = variant.getStockQuantity(); // Lấy tồn kho

            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(detail.getQuantity()));

            String versionName = variant.getVersion().getVersionName();
            String colorName = variant.getColor().getColorName();
            String colorHex = variant.getColor().getHexCode();

            // Lấy ảnh
            String imageUrl = variant.getImageUrl();
            if (imageUrl == null || imageUrl.isBlank()) {
                imageUrl = variant.getProduct().getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                        .map(ProductImageEntity::getImageUrl)
                        .findFirst()
                        .orElse("https://via.placeholder.com/150");
            }

            return CartItemResponse.builder()
                    .id(detail.getId())
                    .productSlug(variant.getProduct().getSlug())
                    .variantId(detail.getVariantId())
                    .productName(variant.getProduct().getProductName())
                    .versionName(versionName)
                    .colorName(colorName)
                    .colorHex(colorHex)
                    .imageUrl(imageUrl)
                    .price(price)
                    .originalPrice(originalPrice)
                    .quantity(detail.getQuantity())
                    .stockQuantity(stockQuantity)
                    .totalPrice(itemTotal)
                    .build();
        }).collect(Collectors.toList());

        for (CartItemResponse item : items) {
            totalValue = totalValue.add(item.getTotalPrice());
            totalQty += item.getQuantity();
        }

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items)
                .totalCartValue(totalValue)
                .totalQuantity(totalQty)
                .build();
    }
}