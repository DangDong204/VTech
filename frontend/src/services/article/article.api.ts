import type { ApiResponse } from '@/defines/apiResponse'
import { api } from '@/utils/axiosCustomize'
import type { ArticleResponse, CreateArticlePayload } from './article.type'

export const getAdminArticlesApi = async () => {
  const res = await api.get<ApiResponse<ArticleResponse[]>>('/admin/articles')
  return res.data.data
}

export const getAdminArticleByIdApi = async (id: string) => {
  const res = await api.get<ApiResponse<ArticleResponse>>(`/admin/articles/${id}`)
  return res.data.data
}

// Upload ảnh lên S3, nhận về URL string
export const uploadArticleImageApi = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<ApiResponse<string>>('/admin/articles/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data.data
}

// Tạo bài viết - gửi JSON thuần, thumbnail là string URL
export const createArticleApi = async (payload: CreateArticlePayload) => {
  const res = await api.post<ApiResponse<ArticleResponse>>('/admin/articles', {
    title: payload.title,
    summary: payload.summary ?? null,
    content: payload.content,
    status: payload.status,
    thumbnail: payload.thumbnail ?? null,
    productIds: payload.productIds ?? []
  })
  return res.data.data
}

// Cập nhật bài viết - gửi JSON thuần
export const updateArticleApi = async (id: string, payload: CreateArticlePayload) => {
  const res = await api.put<ApiResponse<ArticleResponse>>(`/admin/articles/${id}`, {
    title: payload.title,
    summary: payload.summary ?? null,
    content: payload.content,
    status: payload.status,
    thumbnail: payload.thumbnail ?? null,
    productIds: payload.productIds ?? []
  })
  return res.data.data
}

export const deleteSoftArticleApi = async (articleId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/admin/articles/${articleId}`)
  return res.data
}

export const getAdminTrashArticlesApi = async () => {
  const res = await api.get<ApiResponse<ArticleResponse[]>>('/admin/articles/trash')
  return res.data.data
}

export const restoreArticleApi = async (articleId: string) => {
  const res = await api.put<ApiResponse<void>>(`/admin/articles/${articleId}/restore`)
  return res.data
}

export const deleteHardArticleApi = async (articleId: string) => {
  const res = await api.delete<ApiResponse<void>>(`/admin/articles/${articleId}/hard`)
  return res.data
}
