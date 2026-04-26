import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  getMyCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi
} from '@/services/cart/cart.api'
import type { CartResponse, CartItemResponse } from '@/services/cart/cart.type'
import { useAuthStore } from '@/store/auth.store'
import type { ApiErrorResponse } from '@/defines/error.type'

interface HttpError {
  response?: {
    data?: ApiErrorResponse
  }
}

interface CartContextValue {
  cart: CartResponse | null
  items: CartItemResponse[]
  isLoading: boolean
  addItem: (variantId: string, qty?: number) => Promise<void>
  removeItem: (cartDetailId: string) => Promise<void>
  updateQuantity: (cartDetailId: string, qty: number) => Promise<void>
  clear: () => Promise<void>
  fetchCart: () => Promise<void>
  totalCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getMyCartApi()
      setCart(data)
    } catch {
      toast.error('Lỗi khi tải giỏ hàng ')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addItem = useCallback(async (variantId: string, qty = 1) => {
    try {
      const updatedCart = await addToCartApi({ variantId, quantity: qty })
      setCart(updatedCart)
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', {
        id: 'add-cart-success' // Gắn ID để không bị spam toast thành công
      })
    } catch (error: unknown) {
      // Ép kiểu error về HttpError để lấy đúng structure
      const err = error as HttpError
      toast.error(err.response?.data?.message || 'Không thể thêm vào giỏ hàng', {
        id: `add-error-${variantId}`
      })
    }
  }, [])

  const removeItem = useCallback(async (cartDetailId: string) => {
    try {
      const updatedCart = await removeCartItemApi(cartDetailId)
      setCart(updatedCart)
    } catch {
      toast.error('Lỗi khi xóa sản phẩm')
    }
  }, [])

  const updateQuantity = useCallback(async (cartDetailId: string, qty: number) => {
    if (qty < 1) return
    try {
      const updatedCart = await updateCartItemApi(cartDetailId, qty)
      setCart(updatedCart)
    } catch (error: unknown) {
      // Ép kiểu error về HttpError
      const err = error as HttpError
      toast.error(err.response?.data?.message || 'Không thể cập nhật số lượng', {
        id: `qty-error-${cartDetailId}`
      })
    }
  }, [])

  const clear = useCallback(async () => {
    try {
      await clearCartApi()
      setCart(null)
    } catch {
      toast.error('Lỗi khi làm sạch giỏ hàng')
    }
  }, [])

  const items = cart?.items || []
  const totalCount = cart?.totalQuantity || 0
  const subtotal = cart?.totalCartValue || 0

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        fetchCart,
        totalCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
