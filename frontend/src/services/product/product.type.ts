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

export interface SpecificationResponse {
  productId: string
  screenSize?: string
  screenTech?: string
  resolution?: string
  operatingSystem?: string
  chip?: string
  cpu?: string
  gpu?: string
  ram?: string
  storageCapacity?: string
  batteryCapacity?: string
  chargingTech?: string
  backCamera?: string
  frontCamera?: string
  connectivity?: string
  specialFeature?: string
  weight?: string
  releaseDate?: string // Trả về dạng dd-MM-yyyy
}

// Payload cho API Specification
export interface SpecificationPayload {
  screenSize?: string
  screenTech?: string
  resolution?: string
  operatingSystem?: string
  chip?: string
  cpu?: string
  gpu?: string
  ram?: string
  storageCapacity?: string
  batteryCapacity?: string
  chargingTech?: string
  backCamera?: string
  frontCamera?: string
  connectivity?: string
  specialFeature?: string
  weight?: string
  releaseDate?: string // Format YYYY-MM-DD
}
