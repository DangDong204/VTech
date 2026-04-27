import RevenueAreaChart from '@/pages/admin/dashboard/content/Revenueareachart'
import KpiCards from './KpiCards'

import TopProductsBarChart from './TopProductsBarChart'
import OrderStatusPieChart from '@/pages/admin/dashboard/content/Orderstatuspiechart'
import RecentOrdersTable from '@/pages/admin/dashboard/content/Recentorderstable'

export default function DashboardHome() {
  return (
    <div className='flex flex-col gap-4 p-4 md:p-6'>
      {/* Row 1: KPI Cards với bộ lọc ngày/tuần/tháng */}
      <KpiCards />

      {/* Row 2: Biểu đồ doanh thu (2/3) + Trạng thái đơn hàng (1/3) */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <RevenueAreaChart />
        </div>
        <div className='lg:col-span-1'>
          <OrderStatusPieChart />
        </div>
      </div>

      {/* Row 3: Top sản phẩm (full width hoặc 1/2 + 1/2 nếu muốn thêm chart) */}
      <TopProductsBarChart />

      {/* Row 4: Bảng đơn hàng gần đây — full width */}
      <RecentOrdersTable />
    </div>
  )
}
