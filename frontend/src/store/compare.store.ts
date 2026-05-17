import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'

export interface CompareItem {
  id: string
  slug: string
  name: string
  image: string
  category: string
}

interface CompareState {
  items: CompareItem[]
  addItem: (item: CompareItem) => void
  removeItem: (slug: string) => void
  clearAll: () => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items

        // 1. Kiểm tra xem đã có trong list chưa
        if (currentItems.some((i) => i.slug === item.slug)) {
          toast.info('Sản phẩm đã có trong danh sách so sánh!')
          return
        }

        // 2. Kiểm tra khác danh mục
        if (currentItems.length > 0 && currentItems[0].category !== item.category) {
          toast.error('Chỉ có thể so sánh các sản phẩm CÙNG DANH MỤC!')
          return
        }

        // 3. Giới hạn tối đa 3 sản phẩm
        if (currentItems.length >= 3) {
          toast.error('Chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc!')
          return
        }

        set({ items: [...currentItems, item] })
        toast.success('Đã thêm vào danh sách so sánh')
      },
      removeItem: (slug) => {
        set({ items: get().items.filter((i) => i.slug !== slug) })
      },
      clearAll: () => {
        set({ items: [] })
      }
    }),
    {
      name: 'vtech-compare-storage' // Lưu vào localStorage để không bị mất khi F5
    }
  )
)
