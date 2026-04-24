import type { ApiResponse } from '@/defines/apiResponse'
import { api } from '@/utils/axiosCustomize'

export interface ClientCategoryResponse {
  id: string
  categoryName: string
  slug: string
  thumbnailUrl: string
}

export const getClientCategoriesApi = async () => {
  const res = await api.get<ApiResponse<ClientCategoryResponse[]>>('/client/categories')
  return res.data.data
}
