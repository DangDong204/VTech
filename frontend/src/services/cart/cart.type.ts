export interface CartItemRequest {
  variantId: string
  quantity: number
}

export interface CartItemResponse {
  id: string // Tương ứng cartDetailId
  variantId: string
  productSlug: string
  productName: string
  versionName: string
  colorName: string
  colorHex: string
  imageUrl: string
  price: number
  originalPrice: number // Giá gốc
  quantity: number
  stockQuantity: number
  totalPrice: number
}

export interface CartResponse {
  cartId: string
  items: CartItemResponse[]
  totalCartValue: number
  totalQuantity: number
}
