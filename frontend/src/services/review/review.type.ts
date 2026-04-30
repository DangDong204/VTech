export interface ReviewMediaDto {
  id: string
  mediaUrl: string
  mediaType: 'IMAGE' | 'VIDEO'
}

export interface ReviewReplyDto {
  id: string
  replyText: string
  adminName: string
  createdAt: string
}

export interface ReviewResponse {
  id: string
  userId: string
  fullName: string
  avatarUrl: string | null
  productName: string
  productImage: string | null
  variantName: string
  rating: number
  comment: string
  helpfulCount: number
  status: 'APPROVED' | 'PENDING' | 'HIDDEN'
  createdAt: string
  mediaList: ReviewMediaDto[]
  reply: ReviewReplyDto | null
}

export interface CreateReviewPayload {
  orderDetailId: string
  rating: number
  comment?: string
  mediaList?: { mediaUrl: string; mediaType: 'IMAGE' | 'VIDEO' }[]
}

export interface ReplyReviewPayload {
  replyText: string
}
