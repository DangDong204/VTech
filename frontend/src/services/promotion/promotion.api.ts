import type { ApiResponse } from '@/defines/apiResponse'
import type { PromotionPayload, PromotionResponse } from '@/services/promotion/promotion.type'

import { api } from '@/utils/axiosCustomize'

export const getAllPromotionApi = async () => {
  const res = await api.get<ApiResponse<PromotionResponse[]>>('/promotions')
  return res.data.data
}

export const getPromotionByIdApi = async (promotionId: string) => {
  const res = await api.get<ApiResponse<PromotionResponse>>(`/promotions/${promotionId}`)
  return res.data.data
}

export const createPromotionApi = async (payload: PromotionPayload) => {
  const res = await api.post<ApiResponse<PromotionResponse>>('/promotions', payload)
  return res.data
}

export const updatePromotionApi = async (promotionId: string, payload: PromotionPayload) => {
  const res = await api.put<ApiResponse<PromotionResponse>>(`/promotions/${promotionId}`, payload)
  return res.data
}

export const deleteSoftPromotionApi = async (promotionId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/promotions/${promotionId}`)
  return res.data
}

export const getAllPromotionInTrashApi = async () => {
  const res = await api.get<ApiResponse<PromotionResponse[]>>('/promotions/trash')
  return res.data.data
}

export const restorePromotionApi = async (promotionId: string) => {
  const res = await api.patch<ApiResponse<void>>(`/promotions/trash/${promotionId}`)
  return res.data
}

export const deleteHardPromotionApi = async (promotionId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/promotions/trash/${promotionId}`)
  return res.data
}

// ========================
// CLIENT API (KHÁCH HÀNG)
// ========================

// API lấy danh sách các chương trình khuyến mãi đang diễn ra
export const getClientActivePromotionsApi = async () => {
  const res = await api.get<ApiResponse<PromotionResponse[]>>('/client/promotions/active')
  return res.data.data
}
