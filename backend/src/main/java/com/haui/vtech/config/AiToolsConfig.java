package com.haui.vtech.config;

import com.haui.vtech.dto.product.ClientProductDetailResponse;
import com.haui.vtech.dto.product.ClientProductResponse;
import com.haui.vtech.dto.product.ClientVariantResponse;
import com.haui.vtech.dto.promotion.PromotionResponse;
import com.haui.vtech.entity.UserEntity;
import com.haui.vtech.enums.PromotionStatus;
import com.haui.vtech.enums.PromotionType;
import com.haui.vtech.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.Function;

@Configuration
@Slf4j
public class AiToolsConfig {

    /**
     * Định nghĩa Record để nhận Request từ AI
     */
    public record ProductSearchRequest(
            String keyword,
            String categorySlug,
            String brandSlug,
            Long minPrice,
            Long maxPrice
    ) {}

    @Bean
    @Description("Sử dụng công cụ này để tìm kiếm danh sách sản phẩm của cửa hàng VTech. Gọi nó khi người dùng hỏi mua, tìm kiếm, hoặc yêu cầu gợi ý điện thoại, laptop, phụ kiện, hoặc hỏi về giá cả.")
    public Function<ProductSearchRequest, String> searchProductTool(ProductService productService) {
        return request -> {
            log.info("AI Đang sử dụng công cụ tìm kiếm: {}", request);

            BigDecimal min = request.minPrice() != null ? BigDecimal.valueOf(request.minPrice()) : null;
            BigDecimal max = request.maxPrice() != null ? BigDecimal.valueOf(request.maxPrice()) : null;

            try {
                // Tái sử dụng lại hàm tìm kiếm có sẵn
                // Chú ý: Hàm searchClientProducts của bạn hiện không hỗ trợ tham số "keyword" ở Service.
                // Tạm thời AI sẽ lọc theo minPrice, maxPrice, categorySlug và brandSlug.
                List<ClientProductResponse> products = productService.searchClientProducts(
                        request.categorySlug(),
                        request.brandSlug(),
                        null,
                        min,
                        max,
                        "newest"
                );

                // NẾU CÓ KEYWORD (AI bóc tách được từ câu hỏi của user: VD "iphone")
                // Ta sẽ tự lọc thêm trên RAM bằng Java (vì API hiện tại chưa query keyword)
                if (request.keyword() != null && !request.keyword().isBlank()) {
                    String kw = request.keyword().toLowerCase();
                    products = products.stream()
                            .filter(p -> p.getBaseName().toLowerCase().contains(kw))
                            .toList();
                }

                if (products.isEmpty()) {
                    return "Không tìm thấy sản phẩm nào phù hợp với yêu cầu.";
                }

                // Chuyển kết quả thành String để AI đọc
                StringBuilder result = new StringBuilder("Dưới đây là danh sách sản phẩm tìm được:\n");

                // Lấy tối đa 5 sản phẩm để tránh nhồi quá nhiều text vào token của AI
                int limit = Math.min(5, products.size());
                for (int i = 0; i < limit; i++) {
                    ClientProductResponse p = products.get(i);

                    // Xử lý lấy giá thấp nhất từ mảng variants
                    BigDecimal lowestPrice = BigDecimal.ZERO;
                    if (p.getVariants() != null && !p.getVariants().isEmpty()) {
                        lowestPrice = p.getVariants().stream()
                                .map(ClientVariantResponse::getPrice)
                                .min(BigDecimal::compareTo)
                                .orElse(BigDecimal.ZERO);
                    }

                    // Format lại chuỗi cho AI dễ đọc
                    result.append(String.format("- Tên: %s, Giá chỉ từ: %,.0f VNĐ. (Link chi tiết: /product/%s)\n",
                            p.getBaseName(), lowestPrice, p.getSlug()));
                }

                if (products.size() > 5) {
                    result.append(String.format("...và còn %d sản phẩm khác nữa.\n", products.size() - 5));
                }

                return result.toString();

            } catch (Exception e) {
                log.error("Lỗi khi AI tìm kiếm: ", e);
                return "Hệ thống đang lỗi, không thể tìm kiếm sản phẩm lúc này.";
            }
        };
    }

    /**
     * DTO nhận yêu cầu xem chi tiết từ AI
     */
    public record ProductDetailRequest(String productNameOrSlug) {}

    /**
     * Công cụ 2: Lấy thông tin CHI TIẾT sản phẩm
     */
    @Bean
    @Description("Sử dụng công cụ này khi khách hàng yêu cầu xem thông tin chi tiết, cấu hình, màu sắc, phiên bản, thông số kỹ thuật hoặc mô tả của MỘT sản phẩm cụ thể. Tham số truyền vào có thể là tên sản phẩm hoặc slug.")
    public Function<ProductDetailRequest, String> productDetailTool(ProductService productService) {
        return request -> {
            log.info("AI Đang sử dụng công cụ xem chi tiết cho: {}", request);

            try {
                ClientProductDetailResponse detail = null;

                // 1. Thử lấy trực tiếp nếu AI đủ thông minh truyền đúng slug
                try {
                    detail = productService.getClientProductDetail(request.productNameOrSlug());
                } catch (Exception e) {
                    // 2. Nếu AI truyền tên (VD: "iphone 15"), ta phải quét tìm tên rồi lấy slug
                    List<ClientProductResponse> allProducts = productService.searchClientProducts(null, null, null, null, null, "newest");
                    var matchedProduct = allProducts.stream()
                            .filter(p -> p.getBaseName().toLowerCase().contains(request.productNameOrSlug().toLowerCase()))
                            .findFirst();

                    if (matchedProduct.isPresent()) {
                        detail = productService.getClientProductDetail(matchedProduct.get().getSlug());
                    }
                }

                if (detail == null) {
                    return "Rất tiếc, cửa hàng không có thông tin chi tiết về sản phẩm này.";
                }

                // 3. Lắp ráp toàn bộ thông tin chi tiết thành 1 bài văn gửi cho AI đọc
                StringBuilder sb = new StringBuilder();
                sb.append("Tên sản phẩm: ").append(detail.getName()).append("\n");
                sb.append("Mô tả: ").append(detail.getDescription() != null ? detail.getDescription() : "Đang cập nhật").append("\n");

                sb.append("Các phiên bản bộ nhớ/kích thước: ");
                sb.append(detail.getVersions() != null && !detail.getVersions().isEmpty() ? String.join(", ", detail.getVersions()) : "Tiêu chuẩn").append("\n");

                sb.append("Các màu sắc hiện có: ");
                if (detail.getColors() != null && !detail.getColors().isEmpty()) {
                    List<String> colorNames = detail.getColors().stream().map(c -> c.getName()).toList();
                    sb.append(String.join(", ", colorNames)).append("\n");
                } else {
                    sb.append("Mặc định\n");
                }

                sb.append("BẢNG GIÁ VÀ CÁC PHIÊN BẢN:\n");
                if (detail.getVariantList() != null && !detail.getVariantList().isEmpty()) {
                    for (var v : detail.getVariantList()) {
                        // Giả sử DTO variant của bạn có getBasePrice() và getSalePrice() (hoặc getPrice() / getOriginalPrice())
                        // Bạn hãy đổi tên hàm get...() cho khớp với DTO của bạn nhé
                        sb.append(String.format("- Màu %s, Bản %s: Giá gốc: %,.0f VNĐ | Giá khuyến mãi hiện tại: %,.0f VNĐ\n",
                                v.getColor(), v.getVersion(), v.getOriginalPrice(), v.getPrice()));
                    }
                } else {
                    sb.append("Chưa có thông tin giá cụ thể cho các phiên bản.\n");
                }

                sb.append("Thông số kỹ thuật:\n");
                if (detail.getSpecs() != null && !detail.getSpecs().isEmpty()) {
                    detail.getSpecs().forEach(spec -> {
                        sb.append("- ").append(spec.getLabel()).append(": ").append(spec.getValue()).append("\n");
                    });
                } else {
                    sb.append("Đang cập nhật.\n");
                }

                return sb.toString();

            } catch (Exception e) {
                log.error("Lỗi khi AI lấy thông tin chi tiết: ", e);
                return "Hệ thống đang lỗi, không thể lấy thông tin chi tiết lúc này.";
            }
        };
    }

    /**
     * DTO nhận yêu cầu Thêm vào giỏ hàng từ AI
     */
    public record AddToCartRequest(
            String productName,
            String color,    // Màu sắc khách chọn (nếu có)
            String version,  // Phiên bản bộ nhớ (nếu có)
            Integer quantity // Số lượng
    ) {}

    /**
     * Công cụ 3: Thêm sản phẩm vào giỏ hàng
     */
    @Bean
    @Description("Sử dụng công cụ này DUY NHẤT khi người dùng YÊU CẦU MUA HÀNG hoặc THÊM VÀO GIỎ HÀNG. Truyền vào tên sản phẩm, màu sắc, phiên bản và số lượng mà khách muốn. Nếu khách không nhắc đến màu hoặc phiên bản, hãy truyền null.")
    public Function<AddToCartRequest, String> addToCartTool(
            ProductService productService,
            com.haui.vtech.repository.UserRepository userRepository,
            com.haui.vtech.service.CartService cartService // Inject CartService của bạn vào đây
    ) {
        return request -> {
            log.info("AI Đang sử dụng công cụ Thêm vào giỏ hàng: {}", request);

            // 1. KIỂM TRA ĐĂNG NHẬP
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return "Thất bại. Hãy báo với khách hàng rằng họ cần phải ĐĂNG NHẬP hệ thống thì mới có thể thêm sản phẩm vào giỏ hàng được.";
            }

            try {
                // Lấy thông tin user
                String email = auth.getName();
                var userOpt = userRepository.findByEmail(email);
                if (userOpt.isEmpty()) return "Lỗi: Không xác định được danh tính người dùng.";
                String userId = userOpt.get().getId();

                // 2. TÌM SẢN PHẨM KHÁCH MUỐN MUA
                var allProducts = productService.searchClientProducts(null, null, null, null, null, "newest");
                var matchedProductOpt = allProducts.stream()
                        .filter(p -> p.getBaseName().toLowerCase().contains(request.productName().toLowerCase()))
                        .findFirst();

                if (matchedProductOpt.isEmpty()) {
                    return "Không tìm thấy sản phẩm nào tên là: " + request.productName() + ". Hãy báo khách chọn lại.";
                }

                // Gọi lấy Detail để có thông tin danh sách Variant chính xác
                var detail = productService.getClientProductDetail(matchedProductOpt.get().getSlug());

                // 3. XỬ LÝ PHÂN LOẠI (Màu sắc, Phiên bản)
                String matchedVariantId = null;

                if (detail.getVariantList() != null && detail.getVariantList().size() > 1) {
                    // Cần màu và phiên bản
                    if (request.color() == null || request.version() == null) {
                        return "Sản phẩm này có nhiều màu sắc và phiên bản. HÃY HỎI LẠI KHÁCH HÀNG xem họ muốn lấy MÀU GÌ và PHIÊN BẢN NÀO trước khi thêm vào giỏ.";
                    }

                    // Tìm variantId khớp với yêu cầu
                    for (var v : detail.getVariantList()) {
                        if (v.getColor().equalsIgnoreCase(request.color().trim()) &&
                                v.getVersion().equalsIgnoreCase(request.version().trim())) {
                            matchedVariantId = v.getId();
                            break;
                        }
                    }

                    if (matchedVariantId == null) {
                        return String.format("Không có phiên bản Màu '%s' và Bản '%s'. Hãy báo khách chọn lại các màu hiện có.",
                                request.color(), request.version());
                    }
                } else if (detail.getVariantList() != null && detail.getVariantList().size() == 1) {
                    // Sản phẩm chỉ có 1 biến thể duy nhất (mặc định)
                    matchedVariantId = detail.getVariantList().get(0).getId();
                } else {
                    return "Sản phẩm hiện đang lỗi cấu hình kho (không có phiên bản nào).";
                }

                // 4. THÊM VÀO GIỎ HÀNG
                int qty = request.quantity() != null && request.quantity() > 0 ? request.quantity() : 1;

                com.haui.vtech.dto.cart.CartItemRequest cartRequest = new com.haui.vtech.dto.cart.CartItemRequest();
                cartRequest.setVariantId(matchedVariantId);
                cartRequest.setQuantity(qty);

                cartService.addToCart(userId, cartRequest);

                return String.format("Thành công! Đã thêm %d sản phẩm '%s' (Màu: %s, Bản: %s) vào giỏ hàng. Hãy báo tin vui này cho khách và gợi ý khách vào xem Giỏ hàng để thanh toán.",
                        qty, detail.getName(), request.color(), request.version());

            } catch (com.haui.vtech.exception.AppException e) {
                // Bắt chính xác lỗi OutOfStock hoặc VariantNotFound từ CartService ném ra
                log.warn("Lỗi nghiệp vụ khi thêm giỏ hàng: {}", e.getMessage());
                if (e.getErrorCode() == com.haui.vtech.exception.ErrorCode.OUT_OF_STOCK) {
                    return "Thất bại do VƯỢT QUÁ SỐ LƯỢNG TỒN KHO. Hãy xin lỗi khách và báo số lượng hiện tại không đủ.";
                }
                return "Lỗi: " + e.getMessage();
            } catch (Exception e) {
                log.error("Lỗi hệ thống khi AI thêm vào giỏ hàng: ", e);
                return "Hệ thống đang bảo trì chức năng giỏ hàng, hãy xin lỗi khách.";
            }
        };
    }

    /**
     * DTO nhận yêu cầu hỏi khuyến mãi từ AI
     */
    public record PromotionInquiryRequest(
            String type // Có thể là "ACTIVE" (đang diễn ra), "UPCOMING" (sắp tới), hoặc "ALL" (tất cả)
    ) {}

    /**
     * Công cụ 4: Xem chương trình khuyến mãi
     */
    @Bean
    @Description("Sử dụng công cụ này khi khách hàng hỏi về các chương trình khuyến mãi, giảm giá, voucher, ưu đãi hoặc sự kiện sale đang diễn ra hoặc sắp tới.")
    public Function<PromotionInquiryRequest, String> promotionTool(
            com.haui.vtech.service.PromotionService promotionService,
            com.haui.vtech.repository.ProductVariantRepository variantRepository // <-- Inject thêm repo này
    ) {
        return request -> {
            log.info("AI Đang sử dụng công cụ Khuyến mãi: {}", request);

            try {
                // Lấy tất cả khuyến mãi trong hệ thống
                List<com.haui.vtech.dto.promotion.PromotionResponse> allPromotions = promotionService.getAllPromotions();

                // Lọc danh sách theo yêu cầu của AI
                List<com.haui.vtech.dto.promotion.PromotionResponse> filtered = allPromotions.stream()
                        .filter(p -> {
                            if ("UPCOMING".equalsIgnoreCase(request.type())) {
                                return p.getStatus() == com.haui.vtech.enums.PromotionStatus.UPCOMING;
                            } else if ("ACTIVE".equalsIgnoreCase(request.type())) {
                                return p.getStatus() == com.haui.vtech.enums.PromotionStatus.ACTIVE;
                            }
                            return p.getStatus() == com.haui.vtech.enums.PromotionStatus.ACTIVE ||
                                    p.getStatus() == com.haui.vtech.enums.PromotionStatus.UPCOMING;
                        })
                        .toList();

                if (filtered.isEmpty()) {
                    return "Hiện tại cửa hàng chưa có chương trình khuyến mãi nào. Hãy khuyên khách hàng quay lại sau hoặc tham khảo các sản phẩm giá tốt.";
                }

                // Format lại thành đoạn văn bản dễ đọc cho AI
                StringBuilder sb = new StringBuilder("Dưới đây là thông tin các chương trình khuyến mãi:\n");
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

                for (com.haui.vtech.dto.promotion.PromotionResponse p : filtered) {
                    sb.append("- Tên chương trình: ").append(p.getPromotionName()).append("\n");
                    sb.append("  + Nội dung: ").append(p.getPromotionDesc() != null ? p.getPromotionDesc() : "Đang cập nhật").append("\n");

                    String statusText = p.getStatus() == com.haui.vtech.enums.PromotionStatus.ACTIVE ? "Đang diễn ra" : "Sắp diễn ra";
                    sb.append("  + Trạng thái: ").append(statusText).append("\n");

                    String discountInfo = p.getDiscountType() == com.haui.vtech.enums.PromotionType.PERCENTAGE
                            ? p.getDiscountValue() + "%"
                            : String.format("%,.0f VNĐ", p.getDiscountValue());
                    sb.append("  + Mức giảm giá: ").append(discountInfo).append("\n");

                    sb.append("  + Thời gian: Từ ").append(p.getStartDate().format(formatter))
                            .append(" đến ").append(p.getEndDate().format(formatter)).append("\n");

                    // QUÉT TÌM TÊN SẢN PHẨM TỪ VARIANT_IDS
                    if (p.getVariantIds() != null && !p.getVariantIds().isEmpty()) {
                        List<com.haui.vtech.entity.ProductVariantEntity> variants = variantRepository.findAllById(p.getVariantIds());

                        // Dùng Set để lọc trùng lặp tên sản phẩm (vì 1 sản phẩm có thể có nhiều variant màu sắc/bộ nhớ)
                        java.util.Set<String> productNames = variants.stream()
                                .map(v -> v.getProduct().getProductName())
                                .collect(java.util.stream.Collectors.toSet());

                        sb.append("  + CÁC SẢN PHẨM ĐƯỢC ÁP DỤNG: ").append(String.join(", ", productNames)).append("\n\n");
                    } else {
                        sb.append("  + CÁC SẢN PHẨM ĐƯỢC ÁP DỤNG: Áp dụng toàn gian hàng hoặc chưa có sản phẩm cụ thể.\n\n");
                    }
                }

                return sb.toString();

            } catch (Exception e) {
                log.error("Lỗi khi AI lấy khuyến mãi: ", e);
                return "Hệ thống khuyến mãi đang bảo trì, không thể xem lúc này.";
            }
        };
    }

    /**
     * DTO nhận yêu cầu tra cứu đơn hàng từ AI
     */
    public record OrderTrackingRequest(
            String orderCode    // lastest = null
    ) {}

    /**
     * Công cụ 5: Tra cứu đơn hàng
     */
    // Cập nhật lại Description để rèn thêm tính kỷ luật cho AI
    @Bean
    @Description("Sử dụng công cụ này khi khách hàng yêu cầu kiểm tra, tra cứu trạng thái đơn hàng. Nếu khách cung cấp mã đơn, truyền mã đó vào orderCode. Nếu khách hỏi 'đơn gần nhất' hoặc không nhắc đến mã, TUYỆT ĐỐI BỎ TRỐNG (null) trường orderCode.")
    public Function<OrderTrackingRequest, String> orderTrackingTool(
            com.haui.vtech.service.OrderService orderService,
            com.haui.vtech.repository.UserRepository userRepository
    ) {
        return request -> {
            log.info("AI Đang sử dụng công cụ Tra cứu đơn hàng: {}", request);

            // 1. KIỂM TRA BẢO MẬT ĐĂNG NHẬP
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return "Lỗi bảo mật: Không thể tra cứu vì khách chưa đăng nhập. Hãy báo khách đăng nhập tài khoản.";
            }

            try {
                // Lấy userId
                String email = auth.getName();
                var userOpt = userRepository.findByEmail(email);
                if (userOpt.isEmpty()) return "Lỗi: Không tìm thấy thông tin tài khoản.";
                String userId = userOpt.get().getId();

                // Lấy danh sách đơn hàng (đã sắp xếp giảm dần theo thời gian trong OrderService)
                List<com.haui.vtech.dto.order.OrderResponse> myOrders = orderService.getMyOrders(userId);

                if (myOrders.isEmpty()) {
                    return "Dạ khách hàng chưa có bất kỳ đơn hàng nào trên hệ thống VTech.";
                }

                com.haui.vtech.dto.order.OrderResponse targetOrder = null;
                String aiOrderCode = request.orderCode();

                // 2. TRỊ BỆNH "ẢO GIÁC" CỦA AI: Nếu nó tự chế ra các chữ "latest", "gần nhất" -> Ép về null
                if (aiOrderCode != null) {
                    String lowerCode = aiOrderCode.trim().toLowerCase();
                    if (lowerCode.equals("latest") || lowerCode.equals("gần nhất") ||
                            lowerCode.equals("null") || lowerCode.equals("none")) {
                        aiOrderCode = null;
                    }
                }

                // 3. XỬ LÝ TÌM KIẾM
                if (aiOrderCode != null && !aiOrderCode.isBlank()) {
                    // Cần gán vào biến final để dùng trong luồng stream()
                    final String searchCode = aiOrderCode;
                    targetOrder = myOrders.stream()
                            .filter(o -> o.getOrderCode().equalsIgnoreCase(searchCode.trim()))
                            .findFirst()
                            .orElse(null);

                    if (targetOrder == null) {
                        return "Không tìm thấy đơn hàng nào có mã: " + searchCode + " của khách này.";
                    }
                } else {
                    // Nếu biến đã bị ép về null (hỏi đơn gần nhất) -> Lấy đơn đầu tiên trong list
                    targetOrder = myOrders.get(0);
                }

                // Dịch trạng thái sang tiếng Việt cho AI đọc
                String statusVn = switch (targetOrder.getOrderStatus()) {
                    case PENDING -> "Chờ xác nhận";
                    case CONFIRMED -> "Đã xác nhận (đang chuẩn bị hàng)";
                    case PROCESSING -> "Đang đóng gói";
                    case SHIPPING -> "Đang giao cho đơn vị vận chuyển";
                    case DELIVERED -> "Đã giao thành công";
                    case CANCELLED -> "Đã hủy";
                    case RETURNED -> "Đã hoàn trả";
                };

                // Lắp ráp thông tin cho AI
                StringBuilder sb = new StringBuilder("Tra cứu thành công, đây là thông tin đơn hàng:\n");
                sb.append("- Mã đơn: ").append(targetOrder.getOrderCode()).append("\n");
                sb.append("- Trạng thái hiện tại: ").append(statusVn).append("\n");
                sb.append(String.format("- Tổng tiền thanh toán: %,.0f VNĐ\n", targetOrder.getFinalPrice()));

                sb.append("- Các sản phẩm trong đơn:\n");
                for (var item : targetOrder.getOrderDetails()) {
                    sb.append(String.format("  + %s (Màu: %s, Bản: %s) x %d cái\n",
                            item.getProductName(), item.getColorName(), item.getVariantName(), item.getQuantity()));
                }

                return sb.toString();

            } catch (Exception e) {
                log.error("Lỗi hệ thống khi tra cứu đơn: ", e);
                return "Hệ thống tra cứu đang bảo trì, vui lòng báo khách thử lại sau.";
            }
        };
    }

    /**
     * DTO nhận yêu cầu tra cứu điểm V-point từ AI
     */
    public record VpointInquiryRequest() {}

    /**
     * Công cụ 6: Tra cứu điểm V-point và Voucher có thể đổi
     */
    @Bean
    @Description("Sử dụng công cụ này khi khách hàng hỏi về điểm thưởng (V-point), hạng thành viên, hoặc muốn biết họ có thể đổi được những ưu đãi/voucher nào với số điểm hiện tại.")
    public Function<VpointInquiryRequest, String> vpointTrackingTool(
            com.haui.vtech.repository.UserRepository userRepository,
            com.haui.vtech.repository.VoucherRepository voucherRepository
    ) {
        return request -> {
            log.info("AI Đang sử dụng công cụ Tra cứu V-point");

            // 1. KIỂM TRA ĐĂNG NHẬP
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return "Lỗi bảo mật: Khách chưa đăng nhập. Hãy khéo léo yêu cầu khách đăng nhập tài khoản để xem điểm V-point.";
            }

            try {
                // Lấy thông tin User
                String email = auth.getName();
                var userOpt = userRepository.findByEmail(email);
                if (userOpt.isEmpty()) return "Lỗi: Không tìm thấy thông tin tài khoản.";
                var user = userOpt.get();

                int currentPoints = user.getCurrentVpoint() != null ? user.getCurrentVpoint() : 0;
                String memberTier = user.getMemberTier() != null ? user.getMemberTier().name() : "MEMBER";

                StringBuilder sb = new StringBuilder();
                sb.append("Thông tin tài khoản khách hàng:\n");
                sb.append("- Hạng thẻ: ").append(memberTier).append("\n");
                sb.append("- Điểm V-point khả dụng: ").append(currentPoints).append(" điểm\n\n");

                // Lấy tất cả Voucher yêu cầu đổi bằng điểm đang ACTIVE
                var allVouchers = voucherRepository.findAll();
                var pointVouchers = allVouchers.stream()
                        .filter(v -> v.getStatus() == com.haui.vtech.enums.VoucherStatus.ACTIVE)
                        .filter(v -> v.getRequiredPoints() != null && v.getRequiredPoints() > 0)
                        .sorted(java.util.Comparator.comparingInt(com.haui.vtech.entity.VoucherEntity::getRequiredPoints))
                        .toList();

                if (pointVouchers.isEmpty()) {
                    sb.append("Hiện tại cửa hàng không có Voucher nào cho phép đổi bằng điểm V-point.");
                } else {
                    sb.append("Danh sách Voucher có thể đổi:\n");
                    boolean canRedeemAny = false;

                    for (var v : pointVouchers) {
                        String discountType = v.getType().name().equals("FREE_SHIP") ? "Miễn phí vận chuyển" :
                                (v.getType().name().equals("PERCENTAGE") ? "Giảm " + v.getDiscountValue() + "%" : "Giảm " + String.format("%,.0f VNĐ", v.getDiscountValue()));

                        if (currentPoints >= v.getRequiredPoints()) {
                            canRedeemAny = true;
                            sb.append(String.format(" + ĐỦ ĐIỂM ĐỔI: Mã '%s' (%s) - Cần %d điểm.\n",
                                    v.getVoucherCode(), discountType, v.getRequiredPoints()));
                        } else {
                            sb.append(String.format(" + THIẾU ĐIỂM: Mã '%s' (%s) - Cần %d điểm (còn thiếu %d điểm).\n",
                                    v.getVoucherCode(), discountType, v.getRequiredPoints(), v.getRequiredPoints() - currentPoints));
                        }
                    }

                    if (canRedeemAny) {
                        sb.append("\nKhách hàng đã đủ điểm đổi voucher. Hãy gợi ý khách truy cập trang 'Ưu đãi của tôi' hoặc 'Lịch sử điểm thưởng' trên web để bấm đổi mã nhé.");
                    } else {
                        sb.append("\nKhách hàng chưa đủ điểm để đổi bất kỳ voucher nào. Hãy động viên khách mua thêm hàng để tích lũy đủ điểm.");
                    }
                }

                return sb.toString();

            } catch (Exception e) {
                log.error("Lỗi khi AI tra cứu V-point: ", e);
                return "Hệ thống điểm thưởng đang bảo trì, vui lòng báo khách thử lại sau.";
            }
        };
    }
}