export const PromotionType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT'
} as const

export const PromotionStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const

export type PromotionType = (typeof PromotionType)[keyof typeof PromotionType]
export type PromotionStatus = (typeof PromotionStatus)[keyof typeof PromotionStatus]
