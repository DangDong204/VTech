package com.haui.vtech.service;

import com.haui.vtech.dto.dashboard.KpiDataResponse;
import com.haui.vtech.dto.dashboard.OrderStatusChartResponse;
import com.haui.vtech.dto.dashboard.RevenueChartResponse;
import com.haui.vtech.dto.dashboard.TopProductResponse;
import com.haui.vtech.repository.OrderDetailRepository;
import com.haui.vtech.repository.OrderRepository;
import com.haui.vtech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<KpiDataResponse> getKpiData(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentStart, currentEnd, previousStart, previousEnd;

        // 1. Xác định mốc thời gian dựa theo bộ lọc
        switch (period.toLowerCase()) {
            case "day":
                currentStart = now.with(LocalTime.MIN);
                currentEnd = now.with(LocalTime.MAX);
                previousStart = currentStart.minusDays(1);
                previousEnd = currentEnd.minusDays(1);
                break;
            case "week":
                currentStart = now.with(DayOfWeek.MONDAY).with(LocalTime.MIN);
                currentEnd = now.with(DayOfWeek.SUNDAY).with(LocalTime.MAX);
                previousStart = currentStart.minusWeeks(1);
                previousEnd = currentEnd.minusWeeks(1);
                break;
            case "month":
            default:
                currentStart = now.withDayOfMonth(1).with(LocalTime.MIN);
                currentEnd = now.with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);
                previousStart = currentStart.minusMonths(1);
                previousEnd = currentStart.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);
                break;
        }

        // 2. Lấy dữ liệu kỳ hiện tại
        BigDecimal currentRevenue = orderRepository.calculateTotalRevenue(currentStart, currentEnd);
        currentRevenue = currentRevenue != null ? currentRevenue : BigDecimal.ZERO;
        long currentOrders = orderRepository.countTotalOrders(currentStart, currentEnd);
        Long currentProducts = orderDetailRepository.sumProductsSold(currentStart, currentEnd);
        long currentProdCount = currentProducts != null ? currentProducts : 0L;
        long currentCustomers = userRepository.countNewCustomers(currentStart, currentEnd);

        // 3. Lấy dữ liệu kỳ trước để so sánh
        BigDecimal prevRevenue = orderRepository.calculateTotalRevenue(previousStart, previousEnd);
        prevRevenue = prevRevenue != null ? prevRevenue : BigDecimal.ZERO;
        long prevOrders = orderRepository.countTotalOrders(previousStart, previousEnd);
        Long prevProducts = orderDetailRepository.sumProductsSold(previousStart, previousEnd);
        long prevProdCount = prevProducts != null ? prevProducts : 0L;
        long prevCustomers = userRepository.countNewCustomers(previousStart, previousEnd);

        // 4. Tính % tăng trưởng và format dữ liệu
        NumberFormat formatVnd = NumberFormat.getInstance(new Locale("vi", "VN"));
        List<KpiDataResponse> result = new ArrayList<>();

        result.add(KpiDataResponse.builder()
                .label("Doanh thu")
                .value(formatVnd.format(currentRevenue))
                .change(calculateChange(currentRevenue.doubleValue(), prevRevenue.doubleValue()))
                .suffix("₫").build());

        result.add(KpiDataResponse.builder()
                .label("Đơn hàng")
                .value(formatVnd.format(currentOrders))
                .change(calculateChange(currentOrders, prevOrders)).build());

        result.add(KpiDataResponse.builder()
                .label("Sản phẩm đã bán")
                .value(formatVnd.format(currentProdCount))
                .change(calculateChange(currentProdCount, prevProdCount)).build());

        result.add(KpiDataResponse.builder()
                .label("Khách hàng mới")
                .value(formatVnd.format(currentCustomers))
                .change(calculateChange(currentCustomers, prevCustomers)).build());

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderStatusChartResponse> getOrderStatusChart(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentStart, currentEnd;

        // Dùng chung logic lấy thời gian như KPI
        switch (period.toLowerCase()) {
            case "day":
                currentStart = now.with(LocalTime.MIN);
                currentEnd = now.with(LocalTime.MAX);
                break;
            case "week":
                currentStart = now.with(DayOfWeek.MONDAY).with(LocalTime.MIN);
                currentEnd = now.with(DayOfWeek.SUNDAY).with(LocalTime.MAX);
                break;
            case "month":
            default:
                currentStart = now.withDayOfMonth(1).with(LocalTime.MIN);
                currentEnd = now.with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);
                break;
        }

        List<Object[]> results = orderRepository.countOrdersByStatus(currentStart, currentEnd);
        List<OrderStatusChartResponse> chartData = new ArrayList<>();

        for (Object[] row : results) {
            String status = row[0].toString();
            long count = ((Number) row[1]).longValue();
            chartData.add(OrderStatusChartResponse.builder()
                    .name(status)
                    .value(count)
                    .build());
        }

        return chartData;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevenueChartResponse> getRevenueChart(String period) {
        LocalDateTime now = LocalDateTime.now();
        List<RevenueChartResponse> chartData = new ArrayList<>();

        if ("day".equalsIgnoreCase(period)) {
            // Lấy Hôm nay và Hôm qua
            LocalDateTime startToday = now.with(LocalTime.MIN);
            LocalDateTime endToday = now.with(LocalTime.MAX);
            LocalDateTime startYest = startToday.minusDays(1);
            LocalDateTime endYest = endToday.minusDays(1);

            List<Object[]> todayData = orderRepository.getDeliveredOrdersForRevenue(startToday, endToday);
            List<Object[]> yestData = orderRepository.getDeliveredOrdersForRevenue(startYest, endYest);

            // Chia làm 8 mốc (mỗi mốc 3 tiếng)
            double[] todayArr = new double[8];
            double[] yestArr = new double[8];

            for (Object[] row : todayData) {
                int hour = ((LocalDateTime) row[0]).getHour();
                todayArr[hour / 3] += ((BigDecimal) row[1]).doubleValue();
            }
            for (Object[] row : yestData) {
                int hour = ((LocalDateTime) row[0]).getHour();
                yestArr[hour / 3] += ((BigDecimal) row[1]).doubleValue();
            }

            String[] labels = {"0h", "3h", "6h", "9h", "12h", "15h", "18h", "21h"};
            for (int i = 0; i < 8; i++) {
                chartData.add(new RevenueChartResponse(labels[i], todayArr[i], yestArr[i]));
            }
        } else if ("week".equalsIgnoreCase(period)) {
            // Lấy Tuần này và Tuần trước
            LocalDateTime startThisWeek = now.with(DayOfWeek.MONDAY).with(LocalTime.MIN);
            LocalDateTime endThisWeek = now.with(DayOfWeek.SUNDAY).with(LocalTime.MAX);
            LocalDateTime startLastWeek = startThisWeek.minusWeeks(1);
            LocalDateTime endLastWeek = endThisWeek.minusWeeks(1);

            List<Object[]> thisWeekData = orderRepository.getDeliveredOrdersForRevenue(startThisWeek, endThisWeek);
            List<Object[]> lastWeekData = orderRepository.getDeliveredOrdersForRevenue(startLastWeek, endLastWeek);

            double[] thisWeekArr = new double[7];
            double[] lastWeekArr = new double[7];

            for (Object[] row : thisWeekData) {
                int day = ((LocalDateTime) row[0]).getDayOfWeek().getValue(); // 1=Mon, 7=Sun
                thisWeekArr[day - 1] += ((BigDecimal) row[1]).doubleValue();
            }
            for (Object[] row : lastWeekData) {
                int day = ((LocalDateTime) row[0]).getDayOfWeek().getValue();
                lastWeekArr[day - 1] += ((BigDecimal) row[1]).doubleValue();
            }

            String[] labels = {"T2", "T3", "T4", "T5", "T6", "T7", "CN"};
            for (int i = 0; i < 7; i++) {
                chartData.add(new RevenueChartResponse(labels[i], thisWeekArr[i], lastWeekArr[i]));
            }
        } else {
            // Lấy Năm nay và Năm ngoái (Mặc định là Tháng)
            LocalDateTime startThisYear = now.withDayOfYear(1).with(LocalTime.MIN);
            LocalDateTime endThisYear = now.with(TemporalAdjusters.lastDayOfYear()).with(LocalTime.MAX);
            LocalDateTime startLastYear = startThisYear.minusYears(1);
            LocalDateTime endLastYear = endThisYear.minusYears(1);

            List<Object[]> thisYearData = orderRepository.getDeliveredOrdersForRevenue(startThisYear, endThisYear);
            List<Object[]> lastYearData = orderRepository.getDeliveredOrdersForRevenue(startLastYear, endLastYear);

            double[] thisYearArr = new double[12];
            double[] lastYearArr = new double[12];

            for (Object[] row : thisYearData) {
                int month = ((LocalDateTime) row[0]).getMonthValue(); // 1-12
                thisYearArr[month - 1] += ((BigDecimal) row[1]).doubleValue();
            }
            for (Object[] row : lastYearData) {
                int month = ((LocalDateTime) row[0]).getMonthValue();
                lastYearArr[month - 1] += ((BigDecimal) row[1]).doubleValue();
            }

            String[] labels = {"T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"};
            for (int i = 0; i < 12; i++) {
                chartData.add(new RevenueChartResponse(labels[i], thisYearArr[i], lastYearArr[i]));
            }
        }
        return chartData;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductResponse> getTopProducts(String metric) {
        // Chỉ lấy 6 bản ghi đầu tiên
        org.springframework.data.domain.Pageable topSix = org.springframework.data.domain.PageRequest.of(0, 6);
        List<Object[]> results;

        if ("orders".equalsIgnoreCase(metric)) {
            results = orderDetailRepository.getTopProductsByOrders(topSix);
        } else {
            results = orderDetailRepository.getTopProductsByRevenue(topSix);
        }

        List<TopProductResponse> list = new ArrayList<>();
        for (Object[] row : results) {
            list.add(TopProductResponse.builder()
                    .name((String) row[0])
                    .revenue(((BigDecimal) row[1]).doubleValue())
                    .orders(((Number) row[2]).longValue())
                    .build());
        }
        return list;
    }

    private double calculateChange(double current, double previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return Math.round(((current - previous) / previous) * 100.0 * 10.0) / 10.0; // Làm tròn 1 chữ số thập phân
    }
}