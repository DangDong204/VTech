import { api } from '@/utils/axiosCustomize'
import type { ApiResponse } from '@/defines/apiResponse'
import type { CreateReviewPayload, ReplyReviewPayload, ReviewResponse } from './review.type'

// ========================
// CLIENT API (KHÁCH HÀNG)
// ========================

// Lấy danh sách review của 1 sản phẩm (Public)
export const getProductReviewsApi = async (productId: string) => {
  const res = await api.get<ApiResponse<ReviewResponse[]>>(`/client/reviews/product/${productId}`)
  return res.data.data
}

// Khách hàng gửi đánh giá mới (Protected - Cần Token)
export const createReviewApi = async (payload: CreateReviewPayload) => {
  const res = await api.post<ApiResponse<ReviewResponse>>('/client/reviews', payload)
  return res.data.data
}

// Bấm "Hữu ích" cho 1 đánh giá (Protected - Cần Token)
export const voteHelpfulReviewApi = async (reviewId: string) => {
  const res = await api.post<ApiResponse<void>>(`/client/reviews/${reviewId}/helpful`)
  return res.data.data
}

// Upload File (Ảnh/Video) cho Đánh giá
export const uploadReviewMediaApi = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post<ApiResponse<{ mediaUrl: string; mediaType: 'IMAGE' | 'VIDEO' }>>(
    '/client/reviews/upload-media',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return res.data.data
}

// ========================
// ADMIN API (QUẢN TRỊ)
// ========================

// Lấy tất cả review (Protected - Cần Token Admin)
export const getAdminReviewsApi = async () => {
  const res = await api.get<ApiResponse<ReviewResponse[]>>('/admin/reviews')
  return res.data.data
}

// Phản hồi đánh giá của khách (Protected - Cần Token Admin)
export const replyToReviewApi = async (reviewId: string, payload: ReplyReviewPayload) => {
  const res = await api.post<ApiResponse<void>>(`/admin/reviews/${reviewId}/reply`, payload)
  return res.data.data
}

export const updateReviewStatusApi = async (reviewId: string, status: 'APPROVED' | 'HIDDEN') => {
  const res = await api.put<ApiResponse<void>>(`/admin/reviews/${reviewId}/status?status=${status}`)
  return res.data.data
}
