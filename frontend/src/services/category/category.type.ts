import type { CategoryStatus } from '@/defines/enum/category.enum'

export interface CategoryResponse {
  id: string
  categoryName: string
  slug: string
  categoryDesc?: string | null
  thumbnailUrl?: string | null
  parentId?: string | null
  parentName?: string | null
  displayOrder: number
  status: CategoryStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface CreateCategoryPayload {
  categoryName: string
  slug: string
  categoryDesc?: string
  parentId?: string | null
  displayOrder?: number
  thumbnail?: File | null
}

export interface UpdateCategoryPayload {
  categoryName: string
  slug: string
  categoryDesc?: string
  parentId?: string | null
  displayOrder?: number
  status: CategoryStatus
  thumbnail?: File | null
}
