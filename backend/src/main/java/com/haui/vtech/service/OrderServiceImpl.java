package com.haui.vtech.service;

import com.haui.vtech.dto.order.OrderDetailResponse;
import com.haui.vtech.dto.order.OrderHistoryResponse;
import com.haui.vtech.dto.order.OrderRequest;
import com.haui.vtech.dto.order.OrderResponse;
import com.haui.vtech.entity.*;
import com.haui.vtech.enums.OrderStatus;
import com.haui.vtech.enums.PaymentStatus;
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

        // 1. Kiểm tra tồn kho & TRỪ KHO NGAY LẬP TỨC ĐỂ GIỮ CHỖ
        for (CartDetailEntity cartItem : cartItems) {
            ProductVariantEntity variant = variantRepository.findById(cartItem.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, cartItem.getVariantId()));

            if (variant.getStockQuantity() < cartItem.getQuantity()) {
                throw new AppException(ErrorCode.OUT_OF_STOCK, String.valueOf(variant.getStockQuantity()));
            }

            // Trừ tồn kho
            variant.setStockQuantity(variant.getStockQuantity() - cartItem.getQuantity());
            variantRepository.save(variant);

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
                .build();

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

        // 1. CỘNG LẠI TỒN KHO VÌ KHÁCH HỦY ĐƠN
        for (OrderDetailEntity detail : order.getOrderDetails()) {
            ProductVariantEntity variant = variantRepository.findById(detail.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, detail.getVariantId()));

            variant.setStockQuantity(variant.getStockQuantity() + detail.getQuantity());
            variantRepository.save(variant);
        }

        // 2. Chuyển trạng thái
        OrderStatus oldStatus = order.getOrderStatus();
        order.setOrderStatus(OrderStatus.CANCELLED);

        // 3. Lưu lịch sử hủy đơn
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

    // ======================== PHẦN DÀNH CHO ADMIN ========================

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetailForAdmin(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return mapToOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(String adminId, String orderId, OrderStatus newStatus, String note) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        OrderStatus oldStatus = order.getOrderStatus();

        // Validate luồng trạng thái 1 chiều bắt buộc của Admin
        boolean isValidTransition = false;
        if (oldStatus == OrderStatus.PENDING && newStatus == OrderStatus.CONFIRMED) isValidTransition = true;
        if (oldStatus == OrderStatus.CONFIRMED && newStatus == OrderStatus.PROCESSING) isValidTransition = true;
        if (oldStatus == OrderStatus.PROCESSING && newStatus == OrderStatus.SHIPPING) isValidTransition = true;

        if (!isValidTransition) {
            throw new AppException(ErrorCode.ORDER_TRANSITION_INVALID);
        }

        order.setOrderStatus(newStatus);

        OrderHistoryEntity history = OrderHistoryEntity.builder()
                .order(order)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .note(note != null && !note.isBlank() ? note : "Cập nhật trạng thái bởi Admin")
                .createdBy(adminId)
                .build();
        order.getOrderHistories().add(history);

        OrderEntity savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }

    // ======================== PHẦN DÀNH CHO USER BỔ SUNG ========================

    @Override
    @Transactional
    public OrderResponse confirmReceipt(String userId, String orderId) {
        OrderEntity order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getOrderStatus() != OrderStatus.SHIPPING) {
            throw new AppException(ErrorCode.ORDER_NOT_SHIPPING);
        }

        OrderStatus oldStatus = order.getOrderStatus();
        order.setOrderStatus(OrderStatus.DELIVERED);

        // Khi nhận hàng thành công, trạng thái thanh toán chuyển thành PAID (nếu đang là PENDING của COD)
        if (order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        OrderHistoryEntity history = OrderHistoryEntity.builder()
                .order(order)
                .oldStatus(oldStatus)
                .newStatus(OrderStatus.DELIVERED)
                .note("Khách hàng đã xác nhận nhận được hàng")
                .createdBy(userId)
                .build();
        order.getOrderHistories().add(history);

        OrderEntity savedOrder = orderRepository.save(order);
        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse returnOrder(String userId, String orderId, String returnReason) {
        OrderEntity order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.ORDER_NOT_DELIVERED);
        }

        // Tìm thời điểm đơn hàng được chuyển sang DELIVERED
        OrderHistoryEntity deliveryHistory = order.getOrderHistories().stream()
                .filter(h -> h.getNewStatus() == OrderStatus.DELIVERED)
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        // Kiểm tra điều kiện 30 ngày
        if (deliveryHistory.getCreatedAt().plusDays(30).isBefore(java.time.LocalDateTime.now())) {
            throw new AppException(ErrorCode.ORDER_RETURN_EXPIRED);
        }

        // 1. Cộng lại tồn kho
        for (OrderDetailEntity detail : order.getOrderDetails()) {
            ProductVariantEntity variant = variantRepository.findById(detail.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, detail.getVariantId()));

            variant.setStockQuantity(variant.getStockQuantity() + detail.getQuantity());
            variantRepository.save(variant);
        }

        // 2. Chuyển trạng thái
        OrderStatus oldStatus = order.getOrderStatus();
        order.setOrderStatus(OrderStatus.RETURNED);

        // Hoàn trả tiền
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        OrderHistoryEntity history = OrderHistoryEntity.builder()
                .order(order)
                .oldStatus(oldStatus)
                .newStatus(OrderStatus.RETURNED)
                .note(returnReason != null && !returnReason.isBlank() ? returnReason : "Khách hàng hoàn trả đơn")
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

        // VÌ ĐÃ TRỪ KHO LÚC KHÁCH ĐẶT RỒI NÊN ADMIN XÁC NHẬN KHÔNG CẦN TRỪ KHO NỮA

        // 1. Chuyển trạng thái
        order.setOrderStatus(OrderStatus.CONFIRMED);

        // 2. Ghi log lịch sử
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