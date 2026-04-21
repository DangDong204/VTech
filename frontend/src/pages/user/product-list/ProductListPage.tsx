import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Loader2, AlertCircle } from 'lucide-react'

import { ProductCard, type Product } from '@/components/user/home/ProductCard'
import { ClientPagination } from '@/components/user/product-list/ClientPagination'
import { ProductFilterSidebar } from '@/components/user/product-list/ProductFilterSidebar'
import { ProductSortBar } from '@/components/user/product-list/ProductSortBar'
import { getAllProductsApi } from '@/services/product/product.api'

export default function ProductListPage() {
  const { t } = useTranslation('common')

  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('newest')
  const itemsPerPage = 12 // Số sản phẩm trên mỗi trang

  const getHueFromId = (id: string | number) => {
    let hash = 0
    const str = id.toString()

    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    return Math.abs(hash % 360)
  }

  // 1. FETCH DỮ LIỆU TỪ BACKEND
  const {
    data: apiProducts,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['client-products'],
    queryFn: getAllProductsApi
  })

  // 2. ÉP KIỂU (MAPPING) DỮ LIỆU BẰNG USEMEMO (Chỉ chạy lại khi apiProducts thay đổi)
  const products: Product[] = useMemo(() => {
    if (!apiProducts) return []

    return apiProducts.map((item) => {
      const min = item.minPrice || 0
      // Nếu không có maxPrice, giả lập giá gốc cao hơn 10% để hiện giao diện giảm giá cho đẹp
      const originalPrice = item.maxPrice && item.maxPrice > min ? item.maxPrice : min * 1.1

      // Tính % giảm giá
      const discount =
        originalPrice > min ? Math.round(((originalPrice - min) / originalPrice) * 100) : 0

      return {
        id: item.id,
        name: item.productName,
        price: min,
        originalPrice: originalPrice,
        rating: item.ratingAvg || 5, // Mặc định 5 sao nếu backend chưa có rating
        reviews: item.totalReviews || 0,
        discount: discount,
        hue: getHueFromId(item.id), // Random màu nền nếu chưa có ảnh
        image: item.images?.thumbnail || undefined
      }
    })
  }, [apiProducts])

  // 3. LOGIC SẮP XẾP (SORT) PHÍA FRONTEND
  const sortedProducts = useMemo(() => {
    const sorted = [...products]
    if (sortBy === 'price_asc') sorted.sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') sorted.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    // 'newest' tạm thời giữ nguyên thứ tự Backend trả về
    return sorted
  }, [products, sortBy])

  // 4. LOGIC PHÂN TRANG (PAGINATION) PHÍA FRONTEND
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // -- RENDER CÁC TRẠNG THÁI LOADING / ERROR --
  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh]'>
        <Loader2 className='h-10 w-10 animate-spin text-primary' />
        <p className='mt-4 text-muted-foreground'>Đang tải danh sách sản phẩm...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[50vh] text-destructive'>
        <AlertCircle className='h-10 w-10 mb-4' />
        <p>Lỗi khi tải dữ liệu sản phẩm. Vui lòng thử lại sau.</p>
      </div>
    )
  }

  // -- RENDER GIAO DIỆN CHÍNH --
  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <h1 className='text-2xl font-bold mb-6'>{t('categories.phones')}</h1>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Bộ lọc bên trái */}
        <aside className='hidden lg:block lg:col-span-1'>
          <ProductFilterSidebar />
        </aside>

        {/* Danh sách bên phải */}
        <main className='lg:col-span-3'>
          <ProductSortBar
            totalProducts={products.length}
            currentSort={sortBy}
            onSortChange={(val) => {
              setSortBy(val)
              setCurrentPage(1) // Reset về trang 1 khi đổi tiêu chí sắp xếp
            }}
          />

          {currentProducts.length === 0 ? (
            <div className='text-center py-12 bg-card rounded-lg border'>
              <p className='text-muted-foreground'>Chưa có sản phẩm nào.</p>
            </div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <ClientPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </div>
  )
}
