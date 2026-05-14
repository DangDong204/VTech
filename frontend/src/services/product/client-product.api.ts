import type { ApiResponse } from '@/defines/apiResponse'
import { api } from '@/utils/axiosCustomize'
import type { ClientProductDetailResponse, ClientProductResponse } from './client-product.type'

export const getAllClientProductsApi = async () => {
  const res = await api.get<ApiResponse<ClientProductResponse[]>>('/client/products')
  return res.data.data
}

export const getClientProductDetailApi = async (slug: string) => {
  const res = await api.get<ApiResponse<ClientProductDetailResponse>>(`/client/products/${slug}`)
  return res.data.data
}

export interface SearchProductParams {
  categorySlug?: string
  brandSlug?: string
  tagId?: string
  keyword?: string // THÊM DÒNG NÀY
  minPrice?: number
  maxPrice?: number
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating'
}

export const searchClientProductsApi = async (params: SearchProductParams) => {
  const res = await api.get<ApiResponse<ClientProductResponse[]>>('/client/products/search', {
    params
  })
  return res.data.data
}

export const getProductsByPromotionIdApi = async (promotionId: string) => {
  const res = await api.get<ApiResponse<ClientProductResponse[]>>(
    `/client/products/promotions/${promotionId}`
  )
  return res.data.data
}
