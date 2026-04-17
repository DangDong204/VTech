import { ProductStatus } from '@/defines/enum/product.enum'

export interface ProductVariantResponse {
  id: string
  productId: string
  productName: string
  colorId: string
  colorName: string
  hexCode?: string
  versionId: string
  versionName: string
  sku: string
  basePrice: number
  salePrice: number
  stockQuantity: number
  status: ProductStatus
}

export interface ProductVariantPayload {
  productId: string
  colorId: string
  versionId: string
  sku: string
  basePrice: number
  salePrice?: number | null
  stockQuantity: number
  status?: ProductStatus
}
