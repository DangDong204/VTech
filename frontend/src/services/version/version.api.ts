import type { ApiResponse } from '@/defines/apiResponse'
import type { VersionResponse, VersionPayload } from '@/services/version/version.type'
import { api } from '@/utils/axiosCustomize'

export const getAllVersionApi = async () => {
  const res = await api.get<ApiResponse<VersionResponse[]>>('/versions')
  return res.data.data
}

export const createVersionApi = async (payload: VersionPayload) => {
  const res = await api.post<ApiResponse<VersionResponse>>('/versions', payload)
  return res.data
}

export const updateVersionApi = async (versionId: string, payload: VersionPayload) => {
  const res = await api.put<ApiResponse<VersionResponse>>(`/versions/${versionId}`, payload)
  return res.data
}

export const deleteVersionApi = async (versionId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/versions/${versionId}`)
  return res.data
}
