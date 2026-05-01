import type { PromotionType, PromotionStatus } from '@/defines/enum/promotion.enum'

export interface PromotionResponse {
  id: string
  promotionName: string
  promotionDesc?: string | null
  discountType: PromotionType
  discountValue: number
  startDate: string
  endDate: string
  status: PromotionStatus
  variantIds?: string[] | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface PromotionPayload {
  promotionName: string
  promotionDesc?: string | null
  discountType: PromotionType
  discountValue: number
  startDate: string
  endDate: string
  variantIds?: string[] | null
}
