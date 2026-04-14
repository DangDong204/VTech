import type { ApiResponse } from '@/defines/apiResponse'
import type { CreateTagPayload, TagResponse, UpdateTagPayload } from '@/services/tag/tag.type'
import { api } from '@/utils/axiosCustomize'

export const getAllTagApi = async () => {
  const res = await api.get<ApiResponse<TagResponse[]>>('/tags')
  return res.data.data
}

export const createTagApi = async (payload: CreateTagPayload) => {
  const formData = new FormData()

  formData.append('tagName', payload.tagName)
  if (payload.tagDesc) formData.append('tagDesc', payload.tagDesc)

  const res = await api.post<ApiResponse<TagResponse>>('/tags', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return res.data
}

export const updateTagApi = async (tagId: string, payload: UpdateTagPayload) => {
  const formData = new FormData()

  formData.append('tagName', payload.tagName)
  if (payload.tagDesc) formData.append('tagDesc', payload.tagDesc)
  formData.append('status', String(payload.status))

  const res = await api.put<ApiResponse<TagResponse>>(`/tags/${tagId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return res.data
}

export const deleteSoftTagApi = async (tagId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/tags/${tagId}`)
  return res.data
}

export const getAllTagInTrashApi = async () => {
  const res = await api.get<ApiResponse<TagResponse[]>>('/tags/trash')
  return res.data.data
}

export const restoreTagApi = async (tagId: string) => {
  const res = await api.patch<ApiResponse<void>>(`/tags/trash/${tagId}`)
  return res.data
}

export const deleteHardTagApi = async (tagId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/tags/trash/${tagId}`)
  return res.data
}
