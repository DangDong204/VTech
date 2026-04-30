export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
export type PaymentMethod = 'COD' | 'VNPAY' | 'BANK_TRANSFER'
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'

export interface OrderDetailResponse {
  id: string
  variantId: string
  productName: string
  variantName: string
  colorName: string
  imageUrl: string
  quantity: number
  price: number
  totalPrice: number
  reviewed: boolean
}

export interface OrderHistoryResponse {
  id: string
  oldStatus: OrderStatus | null
  newStatus: OrderStatus
  note: string
  createdAt: string
}

export interface OrderResponse {
  id: string
  orderCode: string
  customerName: string
  customerPhone: string
  customerAddress: string
  subTotal: number
  shippingFee: number
  productDiscount: number
  shippingDiscount: number
  finalPrice: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  note: string
  createdAt: string
  orderDetails: OrderDetailResponse[]
  orderHistories: OrderHistoryResponse[]
}

export interface OrderRequest {
  cartDetailIds: string[]
  customerName: string
  customerPhone: string
  customerAddress: string
  paymentMethod: PaymentMethod
  shippingFee: number
  productDiscount: number
  note: string
  voucherIds: string[]
}

export interface UpdateOrderStatusPayload {
  newStatus: OrderStatus
  note?: string
}
