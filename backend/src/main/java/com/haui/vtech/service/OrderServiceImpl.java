package com.haui.vtech.service;

import com.haui.vtech.dto.order.OrderDetailResponse;
import com.haui.vtech.dto.order.OrderHistoryResponse;
import com.haui.vtech.dto.order.OrderRequest;
import com.haui.vtech.dto.order.OrderResponse;
import com.haui.vtech.entity.*;
import com.haui.vtech.enums.OrderStatus;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartDetailRepository cartDetailRepository;
    private final ProductVariantRepository variantRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(String userId, OrderRequest request) {
        if (request.getCartDetailIds() == null || request.getCartDetailIds().isEmpty()) {
            throw new AppException(ErrorCode.EMPTY_ORDER_ITEMS);
        }

        List<CartDetailEntity> cartItems = cartDetailRepository.findAllById(request.getCartDetailIds());
        if (cartItems.isEmpty()) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        List<OrderDetailEntity> orderDetails = new ArrayList<>();

        // 1. Kiểm tra tồn kho & Tính tiền (ĐÃ BỎ LOGIC TRỪ KHO Ở BƯỚC NÀY)
        for (CartDetailEntity cartItem : cartItems) {
            ProductVariantEntity variant = variantRepository.findById(cartItem.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, cartItem.getVariantId()));

            // Vẫn kiểm tra xem kho có đủ không để báo lỗi ngay lúc đặt
            if (variant.getStockQuantity() < cartItem.getQuantity()) {
                throw new AppException(ErrorCode.OUT_OF_STOCK, String.valueOf(variant.getStockQuantity()));
            }

            // ĐÃ XÓA đoạn variant.setStockQuantity(...) ở đây!

            BigDecimal itemTotal = variant.getSalePrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subTotal = subTotal.add(itemTotal);

            // Tạo chi tiết đơn hàng
            OrderDetailEntity orderDetail = OrderDetailEntity.builder()
                    .variantId(variant.getId())
                    .quantity(cartItem.getQuantity())
                    .price(variant.getSalePrice())
                    .totalPrice(itemTotal)
                    .build();
            orderDetails.add(orderDetail);
        }

        // 2. Tính Final Price
        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;
        BigDecimal discount = request.getProductDiscount() != null ? request.getProductDiscount() : BigDecimal.ZERO;

        BigDecimal finalPrice = subTotal.add(shippingFee).subtract(discount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }

        // 3. Lưu Order (Trạng thái PENDING)
        OrderEntity order = OrderEntity.builder()
                .userId(userId)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerAddress(request.getCustomerAddress())
                .subTotal(subTotal)
                .shippingFee(shippingFee)
                .productDiscount(discount)
                .finalPrice(finalPrice)
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .voucherIds(request.getVoucherIds())
                .build(); // PrePersist tự động set PENDING

        // Map ngược order vào detail
        orderDetails.forEach(detail -> detail.setOrder(order));
        order.setOrderDetails(orderDetails);

        // 4. Lưu lịch sử
        OrderHistoryEntity history = OrderHistoryEntity.builder()
                .order(order)
                .newStatus(OrderStatus.PENDING)
                .note("Khách hàng đặt đơn mới")
                .createdBy(userId)
                .build();
        order.getOrderHistories().add(history);

        OrderEntity savedOrder = orderRepository.save(order);

        // 5. Xóa sản phẩm khỏi giỏ hàng
        cartDetailRepository.deleteAll(cartItems);

        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String userId) {
        List<OrderEntity> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream().map(this::mapToOrderResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetail(String userId, String orderId) {
        OrderEntity order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String userId, String orderId, String cancelReason) {
        OrderEntity order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Chỉ cho phép hủy khi đơn hàng đang ở trạng thái PENDING
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        OrderStatus oldStatus = order.getOrderStatus();
        order.setOrderStatus(OrderStatus.CANCELLED);

        // Lưu lịch sử hủy đơn
        OrderHistoryEntity history = OrderHistoryEntity.builder()
                .order(order)
                .oldStatus(oldStatus)
                .newStatus(OrderStatus.CANCELLED)
                .note(cancelReason != null && !cancelReason.isBlank() ? cancelReason : "Khách hàng tự hủy đơn")
                .createdBy(userId)
                .build();
        order.getOrderHistories().add(history);

        OrderEntity savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }

    // --- HÀM MAPPER NỘI BỘ ---
    private OrderResponse mapToOrderResponse(OrderEntity order) {
        List<OrderDetailResponse> details = order.getOrderDetails().stream().map(detail -> {
            ProductVariantEntity variant = variantRepository.findById(detail.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, detail.getVariantId()));

            String imageUrl = variant.getImageUrl();
            if (imageUrl == null || imageUrl.isBlank()) {
                imageUrl = variant.getProduct().getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                        .map(ProductImageEntity::getImageUrl)
                        .findFirst()
                        .orElse("https://via.placeholder.com/150");
            }

            return OrderDetailResponse.builder()
                    .id(detail.getId())
                    .variantId(detail.getVariantId())
                    .productName(variant.getProduct().getProductName())
                    .variantName(variant.getVersion().getVersionName())
                    .colorName(variant.getColor().getColorName())
                    .imageUrl(imageUrl)
                    .quantity(detail.getQuantity())
                    .price(detail.getPrice())
                    .totalPrice(detail.getTotalPrice())
                    .build();
        }).toList();

        List<OrderHistoryResponse> histories = order.getOrderHistories().stream().map(history ->
                OrderHistoryResponse.builder()
                        .id(history.getId())
                        .oldStatus(history.getOldStatus())
                        .newStatus(history.getNewStatus())
                        .note(history.getNote())
                        .createdAt(history.getCreatedAt())
                        .build()
        ).toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .customerAddress(order.getCustomerAddress())
                .subTotal(order.getSubTotal())
                .shippingFee(order.getShippingFee())
                .productDiscount(order.getProductDiscount())
                .shippingDiscount(order.getShippingDiscount())
                .finalPrice(order.getFinalPrice())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .orderDetails(details)
                .orderHistories(histories)
                .build();
    }

    // =========================================================================================
    // DƯỚI ĐÂY LÀ LOGIC THAM KHẢO DÀNH CHO ADMIN SAU NÀY KHI XÁC NHẬN ĐƠN (ĐƯA VÀO ADMIN SERVICE)
    // =========================================================================================

    /*
    @Transactional
    public OrderResponse confirmOrder(String orderId, String adminId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Chỉ xác nhận nếu đơn đang ở trạng thái PENDING
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_STATUS_INVALID);
        }

        // 1. DUYỆT TỪNG CHI TIẾT ĐƠN ĐỂ TRỪ KHO TẠI ĐÂY
        for (OrderDetailEntity detail : order.getOrderDetails()) {
            ProductVariantEntity variant = variantRepository.findById(detail.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, detail.getVariantId()));

            // Lúc này admin xác nhận mới check kho lại lần cuối, nếu đủ thì trừ
            if (variant.getStockQuantity() < detail.getQuantity()) {
                throw new AppException(ErrorCode.OUT_OF_STOCK, "Sản phẩm " + variant.getSku() + " không đủ tồn kho!");
            }

            variant.setStockQuantity(variant.getStockQuantity() - detail.getQuantity());
            variantRepository.save(variant);
        }

        // 2. Chuyển trạng thái
        order.setOrderStatus(OrderStatus.CONFIRMED);

        // 3. Ghi log lịch sử
        OrderHistoryEntity history = OrderHistoryEntity.builder()
                .order(order)
                .oldStatus(OrderStatus.PENDING)
                .newStatus(OrderStatus.CONFIRMED)
                .note("Admin đã xác nhận đơn hàng")
                .createdBy(adminId)
                .build();
        order.getOrderHistories().add(history);

        OrderEntity savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }
    */
}