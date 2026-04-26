import { api } from '@/utils/axiosCustomize'

import type { ApiResponse } from '@/defines/apiResponse'
import type { OrderRequest, OrderResponse } from '@/services/order/order.type'

export const createOrderApi = async (data: OrderRequest): Promise<OrderResponse> => {
  const res = await api.post<ApiResponse<OrderResponse>>('/client/orders', data)
  return res.data.data
}

export const getMyOrdersApi = async (): Promise<OrderResponse[]> => {
  const res = await api.get<ApiResponse<OrderResponse[]>>('/client/orders')
  return res.data.data
}

export const getOrderDetailApi = async (orderId: string): Promise<OrderResponse> => {
  const res = await api.get<ApiResponse<OrderResponse>>(`/client/orders/${orderId}`)
  return res.data.data
}

export const cancelOrderApi = async (orderId: string, reason?: string): Promise<OrderResponse> => {
  const res = await api.put<ApiResponse<OrderResponse>>(`/client/orders/${orderId}/cancel`, null, {
    params: { cancelReason: reason }
  })
  return res.data.data
}
