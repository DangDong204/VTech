import type { VoucherType, VoucherStatus } from '@/defines/enum/voucher.enum'

export interface VoucherResponse {
  id: string
  voucherCode: string
  voucherName: string
  type: VoucherType
  discountValue: number
  maxDiscountAmount?: number | null
  minOrderValue: number
  usageLimit?: number | null
  usedCount: number
  startDate?: string | null
  endDate?: string | null
  status: VoucherStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface VoucherPayload {
  voucherCode: string
  voucherName: string
  type: VoucherType
  discountValue: number
  maxDiscountAmount?: number | null
  minOrderValue: number
  usageLimit?: number | null
  startDate?: string | null
  endDate?: string | null
  status: VoucherStatus
}
