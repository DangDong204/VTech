import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { VpointHistoryResponse } from '@/services/vpoint/vpoint.type'

export const getUserVpointHistoryApi = async (userId: string): Promise<VpointHistoryResponse[]> => {
  const res = await api.get<ApiResponse<VpointHistoryResponse[]>>(`/vpoint/history/${userId}`)
  return res.data.data
}
