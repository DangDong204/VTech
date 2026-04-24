import type { ProductStatus } from '@/defines/enum/product.enum'

export interface ProductResponse {
  id: string
  productName: string
  slug: string
  productDesc?: string | null
  warrantyMonths?: number
  totalViews: number
  totalPurchases: number
  ratingAvg: number
  totalReviews: number
  categoryId?: string
  categoryName?: string
  brandId?: string
  brandName?: string
  tags?: string[]
  status: ProductStatus
  totalStock?: number // Thêm
  minPrice?: number // Thêm
  maxPrice?: number // Thêm
  images?: ProductImageResponse
  specification?: SpecificationResponse
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

// Payload cho @ModelAttribute ProductCreationRequest
export interface CreateProductPayload {
  productName: string
  slug: string
  productDesc?: string
  warrantyMonths?: number
  categoryId: string
  brandId: string
  tagIds?: string[]
}

// Payload cho @ModelAttribute ProductUpdateRequest
export interface UpdateProductPayload {
  productName: string
  slug: string
  productDesc?: string
  warrantyMonths?: number
  categoryId?: string
  brandId?: string
  tagIds?: string[]
  status?: ProductStatus
}

// Payload dành riêng cho API upload ảnh
export interface UploadProductImagesPayload {
  productId: string
  thumbnail?: File | null
  images?: File[] // Mảng các file ảnh chi tiết
}

// -------------------------------------------
// -------- Thông tin ProductResponse --------
// -------------------------------------------
export interface ProductImageResponse {
  thumbnail?: string | null
  images?: string[] | null
}

// Thêm interface mới này
export interface SpecPair {
  label: string
  value: string
}

// Sửa lại 2 interface này
export interface SpecificationResponse {
  productId: string
  attributes?: SpecPair[] // Chuyển từ Record<string, string> sang mảng SpecPair[]
}

export interface SpecificationPayload {
  attributes?: SpecPair[] // Chuyển sang mảng SpecPair[]
}
