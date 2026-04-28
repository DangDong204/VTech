// ============================================================
// MOCK DATA — thay bằng API calls thực tế sau
// ============================================================

export type Period = 'day' | 'week' | 'month'

// --- KPI Cards ---
export interface KpiData {
  label: string
  value: string
  change: number // % so với kỳ trước, dương = tăng
  prefix?: string
  suffix?: string
}

export const kpiData: Record<Period, KpiData[]> = {
  day: [
    { label: 'Doanh thu', value: '42.500.000', change: 12.5, prefix: '', suffix: '₫' },
    { label: 'Đơn hàng', value: '128', change: 8.3 },
    { label: 'Khách hàng mới', value: '34', change: -4.2 },
    { label: 'Tỉ lệ chuyển đổi', value: '3.8', change: 0.5, suffix: '%' }
  ],
  week: [
    { label: 'Doanh thu', value: '287.000.000', change: 7.1, suffix: '₫' },
    { label: 'Đơn hàng', value: '842', change: 5.6 },
    { label: 'Khách hàng mới', value: '218', change: 11.4 },
    { label: 'Tỉ lệ chuyển đổi', value: '4.1', change: -0.3, suffix: '%' }
  ],
  month: [
    { label: 'Doanh thu', value: '1.240.000.000', change: 18.2, suffix: '₫' },
    { label: 'Đơn hàng', value: '3.654', change: 14.7 },
    { label: 'Khách hàng mới', value: '892', change: 22.1 },
    { label: 'Tỉ lệ chuyển đổi', value: '4.6', change: 1.2, suffix: '%' }
  ]
}

// --- Revenue Area Chart ---
export const revenueDataMonth = [
  { label: 'T1', thisYear: 820, lastYear: 680 },
  { label: 'T2', thisYear: 932, lastYear: 720 },
  { label: 'T3', thisYear: 1100, lastYear: 890 },
  { label: 'T4', thisYear: 970, lastYear: 950 },
  { label: 'T5', thisYear: 1240, lastYear: 1020 },
  { label: 'T6', thisYear: 1380, lastYear: 1100 },
  { label: 'T7', thisYear: 1250, lastYear: 1180 },
  { label: 'T8', thisYear: 1480, lastYear: 1220 },
  { label: 'T9', thisYear: 1620, lastYear: 1350 },
  { label: 'T10', thisYear: 1550, lastYear: 1400 },
  { label: 'T11', thisYear: 1780, lastYear: 1480 },
  { label: 'T12', thisYear: 2100, lastYear: 1620 }
]

export const revenueDataWeek = [
  { label: 'T2', thisYear: 320, lastYear: 280 },
  { label: 'T3', thisYear: 410, lastYear: 350 },
  { label: 'T4', thisYear: 380, lastYear: 320 },
  { label: 'T5', thisYear: 520, lastYear: 430 },
  { label: 'T6', thisYear: 490, lastYear: 460 },
  { label: 'T7', thisYear: 680, lastYear: 540 },
  { label: 'CN', thisYear: 420, lastYear: 390 }
]

export const revenueDataDay = [
  { label: '0h', thisYear: 20, lastYear: 15 },
  { label: '3h', thisYear: 8, lastYear: 6 },
  { label: '6h', thisYear: 15, lastYear: 12 },
  { label: '9h', thisYear: 85, lastYear: 70 },
  { label: '12h', thisYear: 120, lastYear: 98 },
  { label: '15h', thisYear: 140, lastYear: 110 },
  { label: '18h', thisYear: 165, lastYear: 130 },
  { label: '21h', thisYear: 95, lastYear: 88 }
]

// --- Order Status Pie ---
export const orderStatusData = [
  { name: 'Hoàn thành', value: 1820, fill: 'var(--color-chart-1)' },
  { name: 'Đang giao', value: 640, fill: 'var(--color-chart-2)' },
  { name: 'Chờ xác nhận', value: 320, fill: 'var(--color-chart-3)' },
  { name: 'Đã huỷ', value: 180, fill: 'var(--color-chart-5)' }
]

// --- Top Products Bar Chart ---
export const topProductsData = [
  { name: 'iPhone 15 Pro', revenue: 2890, orders: 98 },
  { name: 'MacBook Air M3', revenue: 2340, orders: 71 },
  { name: 'Samsung TV 55"', revenue: 1860, orders: 120 },
  { name: 'iPad Pro 12.9"', revenue: 1540, orders: 85 },
  { name: 'Laptop Dell XPS', revenue: 1280, orders: 62 },
  { name: 'AirPods Pro 2', revenue: 980, orders: 143 }
]

// --- Recent Orders ---
export type OrderStatus = 'Hoàn thành' | 'Đang giao' | 'Chờ xác nhận' | 'Đã huỷ'

export interface RecentOrder {
  id: string
  customer: string
  product: string
  amount: number
  status: OrderStatus
  date: string
}

export const recentOrders: RecentOrder[] = [
  {
    id: '#ORD-1031',
    customer: 'Nguyễn Văn An',
    product: 'iPhone 15 Pro Max 256GB',
    amount: 33990000,
    status: 'Hoàn thành',
    date: '27/04/2025'
  },
  {
    id: '#ORD-1030',
    customer: 'Trần Thị Bích',
    product: 'Samsung Galaxy S24 Ultra',
    amount: 28500000,
    status: 'Đang giao',
    date: '27/04/2025'
  },
  {
    id: '#ORD-1029',
    customer: 'Lê Minh Cường',
    product: 'MacBook Air M3 16GB',
    amount: 32900000,
    status: 'Chờ xác nhận',
    date: '26/04/2025'
  },
  {
    id: '#ORD-1028',
    customer: 'Phạm Thu Hà',
    product: 'iPad Pro 12.9" M4',
    amount: 25990000,
    status: 'Hoàn thành',
    date: '26/04/2025'
  },
  {
    id: '#ORD-1027',
    customer: 'Hoàng Đức Long',
    product: 'Sony Bravia 65" OLED',
    amount: 42000000,
    status: 'Đang giao',
    date: '25/04/2025'
  },
  {
    id: '#ORD-1026',
    customer: 'Vũ Thanh Mai',
    product: 'AirPods Pro 2nd Gen',
    amount: 6290000,
    status: 'Đã huỷ',
    date: '25/04/2025'
  },
  {
    id: '#ORD-1025',
    customer: 'Đỗ Quang Minh',
    product: 'Laptop Dell XPS 15',
    amount: 38500000,
    status: 'Hoàn thành',
    date: '24/04/2025'
  }
]
