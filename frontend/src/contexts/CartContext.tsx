import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image?: string
  hue?: number
  variant?: { color?: string; storage?: string }
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clear: () => void
  totalCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const seed: CartItem[] = [
  {
    id: 'iphone-16-pm',
    name: 'iPhone 16 Pro Max 256GB',
    price: 32990000,
    originalPrice: 36990000,
    image:
      'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/iphone-16-plus/iphone-16-plus-trang-1.webp',
    hue: 240,
    variant: { color: 'Titanium', storage: '256GB' },
    quantity: 1
  },
  {
    id: 'airpods-pro-2',
    name: 'AirPods Pro 2 (USB-C)',
    price: 5490000,
    originalPrice: 6490000,
    image:
      'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/iphone-16-plus/iphone-16-plus-hong-1.webp',
    hue: 200,
    variant: { color: 'White' },
    quantity: 2
  }
]

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(seed)

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id)
      if (found) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + qty } : p))
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, qty) } : p)))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const totalCount = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, totalCount, subtotal }}
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
