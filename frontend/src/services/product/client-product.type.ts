// Các interface cho Client
export interface ClientColorOption {
  name: string
  hex: string
}

export interface ClientSpecOption {
  label: string
  value: string
}

export interface ClientVariantDetailResponse {
  id: string
  version: string
  color: string
  colorHex: string
  price: number
  originalPrice: number
}

// Dùng cho trang danh sách (Card)
export interface ClientProductResponse {
  id: string
  baseName: string
  slug: string
  rating: number
  reviews: number
  thumbnail: string
  variants: ClientVariantDetailResponse[]
}

// Dùng cho trang Chi tiết
export interface ClientProductDetailResponse {
  id: string
  name: string
  slug: string // <--- BỔ SUNG DÒNG NÀY
  category: string
  description: string
  price: number
  originalPrice: number
  rating: number
  reviews: number
  images: string[]
  versions: string[]
  colors: ClientColorOption[]
  variantList: ClientVariantDetailResponse[]
  specs: ClientSpecOption[]
}
