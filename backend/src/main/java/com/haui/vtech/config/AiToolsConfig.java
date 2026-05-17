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

            // --- ĐÃ FIX: BỘ LỌC TRỊ BỆNH "ẢO GIÁC" DỮ LIỆU CỦA AI ---

            // 1. Xử lý chuỗi: Nếu AI trả về chuỗi rỗng (""), ta ép nó thành null để DB bỏ qua điều kiện lọc này
            String safeKeyword = (request.keyword() != null && !request.keyword().trim().isEmpty()) ? request.keyword().trim() : null;
            String safeCategorySlug = (request.categorySlug() != null && !request.categorySlug().trim().isEmpty()) ? request.categorySlug().trim() : null;
            String safeBrandSlug = (request.brandSlug() != null && !request.brandSlug().trim().isEmpty()) ? request.brandSlug().trim() : null;

            // 2. Xử lý giá: Nếu AI tự gán giá = 0, ta ép nó thành null để DB không tìm máy có giá 0 VNĐ
            BigDecimal min = (request.minPrice() != null && request.minPrice() > 0) ? BigDecimal.valueOf(request.minPrice()) : null;
            BigDecimal max = (request.maxPrice() != null && request.maxPrice() > 0) ? BigDecimal.valueOf(request.maxPrice()) : null;

            try {
                // Truyền trực tiếp các biến đã được làm sạch (safe) xuống DB
                List<ClientProductResponse> products = productService.searchClientProducts(
                        safeCategorySlug,
                        safeBrandSlug,
                        null,
                        safeKeyword,
                        min,
                        max,
                        "newest"
                );

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

                    // ĐÃ FIX: Dùng cú pháp link chuẩn Markdown: [Text hiển thị](URL)
                    result.append(String.format("- **%s** — Giá chỉ từ: %,.0f VNĐ. [Xem chi tiết](/product/%s)\n",
                            p.getBaseName(), lowestPrice, p.getSlug()));
                }

                if (products.size() > 5) {
                    result.append(String.format("...và còn %d sản phẩm khác nữa.\n", products.size() - 5));
                }

                // ĐÃ FIX: Chỉ thị mạnh (Strong Prompt) cấm AI xóa link
                result.append("\nLƯU Ý QUAN TRỌNG: Bạn BẮT BUỘC PHẢI giữ nguyên đường link [Xem chi tiết](/product/...) kế bên mỗi sản phẩm để khách hàng click vào, không được tự ý xóa bỏ đi.\n");

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
                    // 2. ĐÃ CẬP NHẬT: Nếu lấy bằng slug lỗi, dùng DB để tìm theo keyword thay vì quét toàn bộ RAM
                    List<ClientProductResponse> allProducts = productService.searchClientProducts(
                            null, null, null, request.productNameOrSlug(), null, null, "newest"
                    );

                    var matchedProduct = allProducts.stream().findFirst();

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

                // 2. ĐÃ CẬP NHẬT: TÌM SẢN PHẨM KHÁCH MUỐN MUA QUA KEYWORD
                var allProducts = productService.searchClientProducts(null, null, null, request.productName(), null, null, "newest");
                var matchedProductOpt = allProducts.stream().findFirst();

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

    /**
     * DTO nhận yêu cầu so sánh sản phẩm từ AI
     */
    public record CompareProductsRequest(
            String productA,
            String productB
    ) {}

    /**
     * Công cụ 7: So sánh hai sản phẩm
     */
    @Bean
    @Description("Sử dụng công cụ này khi khách hàng yêu cầu SO SÁNH hai sản phẩm với nhau (VD: So sánh iPhone 15 và Galaxy S24, Máy A với Máy B cái nào tốt hơn). Truyền tên của hai sản phẩm vào productA và productB.")
    public Function<CompareProductsRequest, String> compareProductsTool(ProductService productService) {
        return request -> {
            log.info("AI Đang sử dụng công cụ So sánh sản phẩm: {}", request);

            try {
                // 1. Dùng hàm search để tìm sản phẩm A
                var listA = productService.searchClientProducts(null, null, null, request.productA(), null, null, "newest");
                // 2. Dùng hàm search để tìm sản phẩm B
                var listB = productService.searchClientProducts(null, null, null, request.productB(), null, null, "newest");

                if (listA.isEmpty() || listB.isEmpty()) {
                    return "Không tìm thấy đủ 2 sản phẩm để so sánh. Vui lòng báo khách cung cấp rõ hơn tên từng sản phẩm.";
                }

                // 3. Lấy thông tin chi tiết của 2 sản phẩm đầu tiên tìm được
                var detailA = productService.getClientProductDetail(listA.get(0).getSlug());
                var detailB = productService.getClientProductDetail(listB.get(0).getSlug());

                // 4. Lắp ráp bảng so sánh để gửi cho AI đọc
                StringBuilder sb = new StringBuilder();
                sb.append("Dưới đây là thông số kỹ thuật của 2 sản phẩm để bạn (AI) dựa vào đó tư vấn cho khách:\n\n");

                // --- Thông tin Sản phẩm A ---
                sb.append("=== SẢN PHẨM 1: ").append(detailA.getName()).append(" ===\n");
                sb.append("- Giá thấp nhất: ").append(String.format("%,.0f VNĐ\n", detailA.getPrice()));
                if (detailA.getSpecs() != null) {
                    detailA.getSpecs().forEach(spec ->
                            sb.append("  + ").append(spec.getLabel()).append(": ").append(spec.getValue()).append("\n")
                    );
                }
                sb.append("\n");

                // --- Thông tin Sản phẩm B ---
                sb.append("=== SẢN PHẨM 2: ").append(detailB.getName()).append(" ===\n");
                sb.append("- Giá thấp nhất: ").append(String.format("%,.0f VNĐ\n", detailB.getPrice()));
                if (detailB.getSpecs() != null) {
                    detailB.getSpecs().forEach(spec ->
                            sb.append("  + ").append(spec.getLabel()).append(": ").append(spec.getValue()).append("\n")
                    );
                }

                // --- RÀNG BUỘC KỊCH BẢN BÁN HÀNG DÀNH RIÊNG CHO CÔNG CỤ NÀY ---
                sb.append("\nLƯU Ý QUAN TRỌNG DÀNH CHO BẠN (AI TƯ VẤN):\n");
                sb.append("1. Bạn không được nói sản phẩm nào 'tệ hơn' hay 'yếu hơn'. Hãy biến nhược điểm thành đặc điểm phù hợp cho nhóm đối tượng khác.\n");
                sb.append("2. Tập trung chỉ ra Sản phẩm 1 hợp với AI, Sản phẩm 2 hợp với ai.\n");
                sb.append("3. Nếu giá chênh lệch lớn, hãy khéo léo nói về 'sự tối ưu ngân sách' thay vì nói 'rẻ tiền'.\n");
                sb.append("4. Ở cuối câu trả lời, hãy hỏi ngược lại xem khách hàng thường dùng máy cho nhu cầu gì nhất để bạn chốt lại cho họ nhé.\n");

                return sb.toString();

            } catch (Exception e) {
                log.error("Lỗi khi AI so sánh: ", e);
                return "Hệ thống đang lỗi, không thể lấy thông số so sánh lúc này.";
            }
        };
    }
}