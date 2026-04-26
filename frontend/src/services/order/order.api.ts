import { api } from '@/utils/axiosCustomize'

import type { ApiResponse } from '@/defines/apiResponse'
import type {
  OrderRequest,
  OrderResponse,
  UpdateOrderStatusPayload
} from '@/services/order/order.type'

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

export const confirmReceiptApi = async (orderId: string): Promise<OrderResponse> => {
  const res = await api.put<ApiResponse<OrderResponse>>(`/client/orders/${orderId}/confirm-receipt`)
  return res.data.data
}

export const returnOrderApi = async (orderId: string, reason?: string): Promise<OrderResponse> => {
  const res = await api.put<ApiResponse<OrderResponse>>(`/client/orders/${orderId}/return`, null, {
    params: { returnReason: reason }
  })
  return res.data.data
}

// ADMIN
export const getAllOrdersAdminApi = async (): Promise<OrderResponse[]> => {
  const res = await api.get<ApiResponse<OrderResponse[]>>('/admin/orders')
  return res.data.data
}

export const getOrderDetailAdminApi = async (orderId: string): Promise<OrderResponse> => {
  const res = await api.get<ApiResponse<OrderResponse>>(`/admin/orders/${orderId}`)
  return res.data.data
}

export const updateOrderStatusApi = async (
  orderId: string,
  payload: UpdateOrderStatusPayload
): Promise<OrderResponse> => {
  const res = await api.put<ApiResponse<OrderResponse>>(`/admin/orders/${orderId}/status`, payload)
  return res.data.data
}

export const exportInvoiceAdminApi = async (orderId: string, orderCode: string): Promise<void> => {
  const res = await api.get(`/admin/orders/${orderId}/export-invoice`, {
    responseType: 'blob' // Rất quan trọng để tải file
  })

  // Xử lý tạo link ảo để trình duyệt tự động tải file xuống
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `Hoa_Don_${orderCode}.pdf`) // Tên file tải về
  document.body.appendChild(link)
  link.click()

  // Dọn dẹp DOM sau khi tải xong
  link.parentNode?.removeChild(link)
  window.URL.revokeObjectURL(url)
}
