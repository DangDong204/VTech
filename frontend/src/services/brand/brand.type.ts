import type { BrandStatus } from '@/defines/enum/brand.enum'

export interface BrandReponse {
  id: string
  brandName: string
  slug: string
  brandDesc?: string | null
  brandLogo?: string | null
  displayOrder: number
  status: BrandStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface BrandPayload {
  brandName: string
  slug: string
  brandDesc?: string
  displayOrder?: number
  brandLogo?: File | null
}
