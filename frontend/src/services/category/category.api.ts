import type { ApiResponse } from '@/defines/apiResponse'
import type {
  CategoryResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload
} from '@/services/category/category.type'
import { api } from '@/utils/axiosCustomize'

export const getAllCategoryApi = async () => {
  const res = await api.get<ApiResponse<CategoryResponse[]>>('/categories')
  return res.data.data
}

export const createCategoryApi = async (payload: CreateCategoryPayload) => {
  const formData = new FormData()

  formData.append('categoryName', payload.categoryName)
  formData.append('slug', payload.slug)

  if (payload.categoryDesc) {
    formData.append('categoryDesc', payload.categoryDesc)
  }

  if (payload.parentId) {
    formData.append('parentId', payload.parentId)
  }

  if (payload.displayOrder !== undefined) {
    formData.append('displayOrder', payload.displayOrder.toString())
  }

  if (payload.thumbnail) {
    formData.append('thumbnailUrl', payload.thumbnail)
  }

  const res = await api.post<ApiResponse<CategoryResponse>>('/categories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return res.data.data
}

export const updateCategoryApi = async (categoryId: string, payload: UpdateCategoryPayload) => {
  const formData = new FormData()

  formData.append('categoryName', payload.categoryName)
  formData.append('slug', payload.slug)
  formData.append('status', String(payload.status))

  if (payload.categoryDesc) formData.append('categoryDesc', payload.categoryDesc)

  if (payload.parentId) formData.append('parentId', payload.parentId)

  if (payload.displayOrder !== undefined)
    formData.append('displayOrder', String(payload.displayOrder))

  if (payload.thumbnail) formData.append('thumbnailUrl', payload.thumbnail)

  const res = await api.put<ApiResponse<CategoryResponse>>(`/categories/${categoryId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  return res.data.data
}

export const deleteSoftCategoryApi = async (categoryId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/categories/${categoryId}`)
  return res.data
}

export const getAllCategoryInTrashApi = async () => {
  const res = await api.get<ApiResponse<CategoryResponse[]>>('/categories/trash')
  return res.data.data
}

export const restoreCategoryApi = async (categoryId: string) => {
  const res = await api.patch<ApiResponse<void>>(`/categories/trash/${categoryId}`)
  return res.data
}

export const deleteHardCategoryApi = async (categoryId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/categories/trash/${categoryId}`)
  return res.data
}
