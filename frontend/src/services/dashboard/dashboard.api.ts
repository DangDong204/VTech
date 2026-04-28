import { api } from '@/utils/axiosCustomize'

export interface KpiData {
  label: string
  value: string
  change: number
  prefix?: string
  suffix?: string
}

export const getKpiDataApi = async (period: 'day' | 'week' | 'month') => {
  const res = await api.get<{ data: KpiData[] }>(`/admin/dashboard/kpi?period=${period}`)
  return res.data.data
}

export interface OrderStatusChartData {
  name: string
  value: number
}

export const getOrderStatusChartApi = async (period: 'day' | 'week' | 'month') => {
  const res = await api.get<{ data: OrderStatusChartData[] }>(
    `/admin/dashboard/order-status?period=${period}`
  )
  return res.data.data
}

export interface RevenueChartData {
  label: string
  thisYear: number
  lastYear: number
}

export const getRevenueChartApi = async (period: 'day' | 'week' | 'month') => {
  const res = await api.get<{ data: RevenueChartData[] }>(
    `/admin/dashboard/revenue?period=${period}`
  )
  return res.data.data
}

export interface TopProductData {
  name: string
  revenue: number
  orders: number
}

export const getTopProductsApi = async (metric: 'revenue' | 'orders') => {
  const res = await api.get<{ data: TopProductData[] }>(
    `/admin/dashboard/top-products?metric=${metric}`
  )
  return res.data.data
}
