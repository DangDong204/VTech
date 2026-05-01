package com.haui.vtech.service;

import com.haui.vtech.config.VnPayConfig;
import com.haui.vtech.dto.order.OrderDetailResponse;
import com.haui.vtech.dto.order.OrderHistoryResponse;
import com.haui.vtech.dto.order.OrderRequest;
import com.haui.vtech.dto.order.OrderResponse;
import com.haui.vtech.entity.*;
import com.haui.vtech.enums.OrderStatus;
import com.haui.vtech.enums.PaymentMethod;
import com.haui.vtech.enums.PaymentStatus;
import com.haui.vtech.enums.VpointTransactionType;
import com.haui.vtech.exception.AppException;
import com.haui.vtech.exception.ErrorCode;
import com.haui.vtech.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartDetailRepository cartDetailRepository;
    private final ProductVariantRepository variantRepository;
    private final VnPayConfig vnPayConfig;
    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository; // THÊM DÒNG NÀY (để lấy email user)
    private final EmailService emailService;     // THÊM DÒNG NÀY
    private final ReviewRepository reviewRepository;
    private final VpointService vpointService;

    @Value("${app.vpoint.exchange-rate:10000}")
    private int vpointExchangeRate;

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

        // 1. Kiểm tra tồn kho & TRỪ KHO
        for (CartDetailEntity cartItem : cartItems) {
            ProductVariantEntity variant = variantRepository.findById(cartItem.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, cartItem.getVariantId()));

            if (variant.getStockQuantity() < cartItem.getQuantity()) {
                throw new AppException(ErrorCode.OUT_OF_STOCK, String.valueOf(variant.getStockQuantity()));
            }

            variant.setStockQuantity(variant.getStockQuantity() - cartItem.getQuantity());
            variantRepository.save(variant);

            BigDecimal itemTotal = variant.getSalePrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subTotal = subTotal.add(itemTotal);

            OrderDetailEntity orderDetail = OrderDetailEntity.builder()
                    .variantId(variant.getId())
                    .quantity(cartItem.getQuantity())
                    .price(variant.getSalePrice())
                    .totalPrice(itemTotal)
                    .build();
            orderDetails.add(orderDetail);
        }

        // 2. Tính toán phí Ship (Tạm thời lấy từ Request, thực tế nên gọi API GiaoHàngNhanh ở Backend)
        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;

        // 3. TÍNH TOÁN VOUCHER (BẢO MẬT: BACKEND TỰ TÍNH, KHÔNG TIN FRONTEND)
        BigDecimal productDiscount = BigDecimal.ZERO;
        BigDecimal shippingDiscount = BigDecimal.ZERO;
        List<VoucherEntity> appliedVouchers = new ArrayList<>();

        if (request.getVoucherIds() != null && !request.getVoucherIds().isEmpty()) {
            appliedVouchers = voucherRepository.findAllById(request.getVoucherIds());

            for (VoucherEntity voucher : appliedVouchers) {
                // a. Validate Voucher (Kiểm tra hợp lệ)
                if (voucher.getStatus() != com.haui.vtech.enums.VoucherStatus.ACTIVE) {
                    throw new AppException(ErrorCode.VOUCHER_INACTIVE); // SỬA Ở ĐÂY
                }
                if (voucher.getStartDate().isAfter(LocalDateTime.now()) || voucher.getEndDate().isBefore(LocalDateTime.now())) {
                    throw new AppException(ErrorCode.VOUCHER_EXPIRED); // SỬA Ở ĐÂY
                }
                if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                    throw new AppException(ErrorCode.VOUCHER_OUT_OF_USAGE); // SỬA Ở ĐÂY
                }
                if (subTotal.compareTo(voucher.getMinOrderValue()) < 0) {
                    throw new AppException(ErrorCode.VOUCHER_CONDITION_NOT_MET); // SỬA Ở ĐÂY
                }

                // b. Phân loại và tính tiền giảm
                switch (voucher.getType()) {
                    case FREE_SHIP:
                        BigDecimal shipDiscount = voucher.getDiscountValue();

                        if (voucher.getMaxDiscountAmount() != null && voucher.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                            shipDiscount = shipDiscount.min(voucher.getMaxDiscountAmount());
                        }

                        // Cộng dồn vào tổng tiền giảm ship của đơn
                        shippingDiscount = shippingDiscount.add(shippingFee.min(shipDiscount));
                        break;

                    case FIXED_AMOUNT:
                        productDiscount = productDiscount.add(voucher.getDiscountValue());
                        break;

                    case PERCENTAGE:
                        // Tính % giảm: subTotal * discountValue / 100
                        BigDecimal calcPercent = subTotal.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100));
                        // Ép giới hạn Max Discount nếu có (VD: Giảm 10% nhưng tối đa 50k)
                        if (voucher.getMaxDiscountAmount() != null) {
                            calcPercent = calcPercent.min(voucher.getMaxDiscountAmount());
                        }
                        productDiscount = productDiscount.add(calcPercent);
                        break;
                }

                // c. Tăng biến đếm lượt dùng
                voucher.setUsedCount(voucher.getUsedCount() + 1);
            }
            // Lưu lại lượt dùng mới vào DB
            voucherRepository.saveAll(appliedVouchers);
        }

        // Chặn trường hợp tiền giảm giá sản phẩm lớn hơn tiền hàng
        productDiscount = productDiscount.min(subTotal);

        // 4. Tính Final Price cuối cùng
        BigDecimal finalPrice = subTotal.add(shippingFee).subtract(productDiscount).subtract(shippingDiscount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }

        // 5. Lưu Order
        OrderEntity order = OrderEntity.builder()
                .userId(userId)
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerAddress(request.getCustomerAddress())
                .subTotal(subTotal)
                .shippingFee(shippingFee)
                .productDiscount(productDiscount) // Đưa tiền giảm thực tế Backend tính được vào
                .shippingDiscount(shippingDiscount) // Đưa tiền giảm ship vào
                .finalPrice(finalPrice)
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .voucherIds(request.getVoucherIds()) // Lưu ID để biết khách dùng mã nào
                .build();

        orderDetails.forEach(detail -> detail.setOrder(order));
        order.setOrderDetails(orderDetails);

        OrderHistoryEntity history = OrderHistoryEntity.builder()
                .order(order)
                .newStatus(OrderStatus.PENDING)
                .note("Khách hàng đặt đơn mới")
                .createdBy(userId)
                .build();
        order.getOrderHistories().add(history);

        OrderEntity savedOrder = orderRepository.save(order);
        cartDetailRepository.deleteAll(cartItems);

        // GỌI HÀM GỬI EMAIL NGẦM (Lấy email từ bảng User)
        OrderResponse response = mapToOrderResponse(savedOrder);

        userRepository.findById(userId).ifPresent(user -> {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                String statusText = request.getPaymentMethod() == PaymentMethod.VNPAY
                        ? "ĐẶT HÀNG THÀNH CÔNG (Đang chờ thanh toán VNPAY)"
                        : "ĐẶT HÀNG THÀNH CÔNG (Chờ Shop xác nhận)";
                // TRUYỀN RESPONSE VÀO HÀM GỬI MAIL
                emailService.sendOrderStatusEmail(user.getEmail(), response, statusText);
            }
        });

        // RETURN LUÔN RESPONSE VỪA MAP
        return response;
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

        // GỌI HÀM GỬI EMAIL NGẦM (Lấy email từ bảng User)
        OrderResponse response = mapToOrderResponse(savedOrder);

        userRepository.findById(userId).ifPresent(user -> {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendOrderStatusEmail(user.getEmail(), response, "ĐÃ HỦY ĐƠN HÀNG");
            }
        });

        return response;
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
        boolean isValidTransition = false;
        if (oldStatus == OrderStatus.PENDING && newStatus == OrderStatus.CONFIRMED) isValidTransition = true;
        if (oldStatus == OrderStatus.CONFIRMED && newStatus == OrderStatus.PROCESSING) isValidTransition = true;
        if (oldStatus == OrderStatus.PROCESSING && newStatus == OrderStatus.SHIPPING) isValidTransition = true;
        if (oldStatus == OrderStatus.SHIPPING && newStatus == OrderStatus.DELIVERED) isValidTransition = true;

        if (!isValidTransition) {
            throw new AppException(ErrorCode.ORDER_TRANSITION_INVALID);
        }

        order.setOrderStatus(newStatus);

        if (newStatus == OrderStatus.DELIVERED) {
            if (order.getPaymentStatus() == PaymentStatus.PENDING) {
                order.setPaymentStatus(PaymentStatus.PAID);
            }
            // SỬA Ở ĐÂY: Sử dụng biến cấu hình
            int earnedPoints = order.getFinalPrice().intValue() / vpointExchangeRate;
            if (earnedPoints > 0) {
                vpointService.addPoints(order.getUserId(), earnedPoints, VpointTransactionType.EARN_ORDER, order.getId(), "Tích điểm tự động (Mua đơn: " + order.getOrderCode() + ")");
            }
        }

        OrderHistoryEntity history = OrderHistoryEntity.builder()
                .order(order)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .note(note != null && !note.isBlank() ? note : "Cập nhật trạng thái bởi Admin")
                .createdBy(adminId)
                .build();
        order.getOrderHistories().add(history);

        OrderEntity savedOrder = orderRepository.save(order);
        OrderResponse response = mapToOrderResponse(savedOrder);

        userRepository.findById(order.getUserId()).ifPresent(user -> {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                String statusVn = getTranslatedStatus(newStatus);
                emailService.sendOrderStatusEmail(user.getEmail(), response, statusVn);
            }
        });

        return response;
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

        if (order.getPaymentStatus() == PaymentStatus.PENDING) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        int earnedPoints = order.getFinalPrice().intValue() / vpointExchangeRate;
        if (earnedPoints > 0) {
            vpointService.addPoints(userId, earnedPoints, VpointTransactionType.EARN_ORDER, order.getId(), "Tích điểm tự động (Mua đơn: " + order.getOrderCode() + ")");
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
        OrderResponse response = mapToOrderResponse(savedOrder);

        userRepository.findById(userId).ifPresent(user -> {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendOrderStatusEmail(user.getEmail(), response, "GIAO HÀNG THÀNH CÔNG");
            }
        });

        return response;
    }

    @Override
    @Transactional
    public OrderResponse returnOrder(String userId, String orderId, String returnReason) {
        OrderEntity order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.ORDER_NOT_DELIVERED);
        }

        OrderHistoryEntity deliveryHistory = order.getOrderHistories().stream()
                .filter(h -> h.getNewStatus() == OrderStatus.DELIVERED)
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        if (deliveryHistory.getCreatedAt().plusDays(30).isBefore(java.time.LocalDateTime.now())) {
            throw new AppException(ErrorCode.ORDER_RETURN_EXPIRED);
        }

        boolean hasReviewedItem = order.getOrderDetails().stream()
                .anyMatch(detail -> reviewRepository.existsByOrderDetailId(detail.getId()));

        if (hasReviewedItem) {
            throw new AppException(ErrorCode.ORDER_CANNOT_RETURN_REVIEWED);
        }

        for (OrderDetailEntity detail : order.getOrderDetails()) {
            ProductVariantEntity variant = variantRepository.findById(detail.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.VARIANT_NOT_FOUND, detail.getVariantId()));

            variant.setStockQuantity(variant.getStockQuantity() + detail.getQuantity());
            variantRepository.save(variant);
        }

        OrderStatus oldStatus = order.getOrderStatus();
        order.setOrderStatus(OrderStatus.RETURNED);

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        // SỬA Ở ĐÂY: Sử dụng biến cấu hình
        int earnedPoints = order.getFinalPrice().intValue() / vpointExchangeRate;
        if (earnedPoints > 0) {
            vpointService.deductPoints(
                    userId,
                    earnedPoints,
                    VpointTransactionType.DEDUCT_RETURN,
                    order.getId(),
                    "Thu hồi điểm do hoàn trả đơn hàng: " + order.getOrderCode()
            );
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
        OrderResponse response = mapToOrderResponse(savedOrder);

        userRepository.findById(userId).ifPresent(user -> {
            if (user.getEmail() != null && !user.getEmail().isBlank()) {
                emailService.sendOrderStatusEmail(user.getEmail(), response, "ĐÃ HOÀN TRẢ");
            }
        });

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public String createPaymentUrl(String orderId, HttpServletRequest request) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Chỉ cho phép thanh toán nếu đơn hàng đang PENDING và chọn thanh toán VNPAY
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); // Bạn có thể tạo mã lỗi ORDER_NOT_PENDING
        }

        // 1. Khởi tạo các tham số bắt buộc
        long amount = order.getFinalPrice().longValue() * 100L; // Bắt buộc nhân 100

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnp_TmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", order.getOrderCode()); // Dùng mã đơn hàng làm mã giao dịch
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang VTech: " + order.getOrderCode());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
        vnp_Params.put("vnp_IpAddr", VnPayConfig.getIpAddress(request));

        // 2. Format Ngày giờ theo chuẩn GMT+7
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // Hạn thanh toán (Cho phép 15 phút)
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // 3. Sắp xếp tham số theo bảng chữ cái (Bắt buộc để băm checksum chuẩn)
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        try {
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Lỗi mã hóa URL VNPAY");
        }

        // 4. Tạo mã băm bảo mật (Secure Hash)
        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        // 5. Nối với URL gốc của VNPAY
        return vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;
    }

    @Override
    @Transactional
    public OrderResponse processVnPayReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        if (fields.containsKey("vnp_SecureHashType")) {
            fields.remove("vnp_SecureHashType");
        }
        if (fields.containsKey("vnp_SecureHash")) {
            fields.remove("vnp_SecureHash");
        }

        // Tạo lại mã hash từ các tham số trả về để kiểm tra tính toàn vẹn
        String signValue = hashAllFields(fields, vnPayConfig.getSecretKey());

        if (signValue.equals(vnp_SecureHash)) {
            // Mã hash hợp lệ, kiểm tra trạng thái giao dịch
            String orderCode = request.getParameter("vnp_TxnRef");
            String responseCode = request.getParameter("vnp_ResponseCode");

            OrderEntity order = orderRepository.findByOrderCode(orderCode)
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

            if ("00".equals(responseCode)) {
                // Giao dịch thành công
                if (order.getPaymentStatus() == PaymentStatus.PENDING) {
                    // 1. Cập nhật trạng thái thanh toán
                    order.setPaymentStatus(PaymentStatus.PAID);

                    // 2. TỰ ĐỘNG XÁC NHẬN ĐƠN HÀNG VÌ KHÁCH ĐÃ TRẢ TIỀN TRƯỚC
                    OrderStatus oldStatus = order.getOrderStatus();
                    order.setOrderStatus(OrderStatus.CONFIRMED);

                    // 3. Lưu lịch sử đơn hàng với trạng thái mới
                    OrderHistoryEntity history = OrderHistoryEntity.builder()
                            .order(order)
                            .oldStatus(oldStatus)
                            .newStatus(OrderStatus.CONFIRMED)
                            .note("Thanh toán VNPAY thành công. Đơn hàng được tự động xác nhận.")
                            .createdBy("SYSTEM")
                            .build();
                    order.getOrderHistories().add(history);

                    orderRepository.save(order);
                    // 4. GỌI HÀM GỬI EMAIL NGẦM THÔNG BÁO ĐƠN HÀNG ĐÃ THANH TOÁN VÀ XÁC NHẬN
                    OrderResponse response = mapToOrderResponse(order);

                    userRepository.findById(order.getUserId()).ifPresent(user -> {
                        if (user.getEmail() != null && !user.getEmail().isBlank()) {
                            emailService.sendOrderStatusEmail(user.getEmail(), response, "ĐÃ THANH TOÁN VNPAY & XÁC NHẬN");
                        }
                    });

                    return response;
                }
                return mapToOrderResponse(order);
            } else {
                // GIAO DỊCH THẤT BẠI (Khách hủy, thẻ lỗi, sai OTP...)
                // KỊCH BẢN MỚI: Không hủy đơn ngay, cho phép khách hàng thanh toán lại trong 15 phút
                if (order.getOrderStatus() == OrderStatus.PENDING) {

                    // Chỉ ghi lịch sử để Admin biết khách đã từng thanh toán xịt 1 lần
                    OrderHistoryEntity history = OrderHistoryEntity.builder()
                            .order(order)
                            .oldStatus(order.getOrderStatus()) // Vẫn giữ PENDING
                            .newStatus(order.getOrderStatus()) // Vẫn giữ PENDING
                            .note("Thanh toán VNPAY thất bại (Mã lỗi: " + responseCode + "). Đang chờ khách thanh toán lại.")
                            .createdBy("SYSTEM")
                            .build();
                    order.getOrderHistories().add(history);
                    orderRepository.save(order);
                }

                // Trả về order bình thường (Frontend sẽ tự đọc URL để biết là xịt)
                return mapToOrderResponse(order);
            }
        } else {
            // Bị hacker can thiệp URL
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); // Thay bằng lỗi INVALID_HASH
        }
    }

    // Hàm hỗ trợ băm lại các tham số (Bạn thêm ngay dưới processVnPayReturn)
    private String hashAllFields(Map<String, String> fields, String secretKey) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                sb.append(fieldName);
                sb.append("=");
                try {
                    sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            if (itr.hasNext()) {
                sb.append("&");
            }
        }
        return VnPayConfig.hmacSHA512(secretKey, sb.toString());
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
                    .reviewed(reviewRepository.existsByOrderDetailId(detail.getId()))
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

    private String getTranslatedStatus(OrderStatus status) {
        return switch (status) {
            case PENDING -> "Chờ xác nhận";
            case CONFIRMED -> "Đã xác nhận";
            case PROCESSING -> "Đang đóng gói";
            case SHIPPING -> "Đang giao hàng";
            case DELIVERED -> "Đã giao thành công";
            case CANCELLED -> "Đã hủy";
            case RETURNED -> "Hoàn trả";
        };
    }
}