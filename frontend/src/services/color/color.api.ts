import type { ApiResponse } from '@/defines/apiResponse'
import type { ColorPayload, ColorResponse } from '@/services/color/color.type'
import { api } from '@/utils/axiosCustomize'

export const getAllColorApi = async () => {
  const res = await api.get<ApiResponse<ColorResponse[]>>('/colors')
  return res.data.data
}

export const createColorApi = async (payload: ColorPayload) => {
  const res = await api.post<ApiResponse<ColorResponse>>('/colors', payload)
  return res.data
}

export const updateColorApi = async (colorId: string, payload: ColorPayload) => {
  const res = await api.put<ApiResponse<ColorResponse>>(`/colors/${colorId}`, payload)
  return res.data
}

export const deleteColorApi = async (colorId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/colors/${colorId}`)
  return res.data
}
