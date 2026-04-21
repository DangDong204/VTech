export const VoucherType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  FREE_SHIP: 'FREE_SHIP'
} as const

export const VoucherStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const

export type VoucherType = (typeof VoucherType)[keyof typeof VoucherType]
export type VoucherStatus = (typeof VoucherStatus)[keyof typeof VoucherStatus]
