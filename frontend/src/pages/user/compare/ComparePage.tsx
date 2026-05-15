import { Button } from '@/components/ui/button'
import { getCompareProductsApi } from '@/services/product/client-product.api'
import { useCompareStore } from '@/store/compare.store'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Home, Loader2, Star, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

export default function ComparePage() {
  const { t } = useTranslation('common')
  const { items, removeItem } = useCompareStore()
  const navigate = useNavigate()

  // Chuyển mảng items thành mảng slugs để gọi API
  const slugs = items.map((i) => i.slug)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['compare-products', slugs],
    queryFn: () => getCompareProductsApi(slugs),
    enabled: slugs.length > 0
  })

  // Nếu không có sản phẩm nào
  if (items.length === 0) {
    return (
      <div className='container mx-auto py-20 text-center'>
        <h2 className='text-2xl font-bold mb-4'>
          {t('compare.emptyTitle', 'Bạn chưa chọn sản phẩm nào để so sánh')}
        </h2>
        <Button onClick={() => navigate('/products')}>
          {t('compare.continueShopping', 'Tiếp tục mua sắm')}
        </Button>
      </div>
    )
  }

  // --- THUẬT TOÁN GOM NHÓM THÔNG SỐ (SPECS) ---
  const allSpecLabels = Array.from(
    new Set(products.flatMap((p) => p.specs?.map((s) => s.label) || []))
  )

  return (
    <div className='bg-slate-50 min-h-screen pb-12 pt-4'>
      <div className='container mx-auto px-4 max-w-7xl'>
        {/* Breadcrumb */}
        <nav className='flex items-center text-sm text-muted-foreground mb-6'>
          <Link to='/' className='hover:text-primary flex items-center gap-1 transition-colors'>
            <Home className='h-4 w-4' /> {t('nav.home')}
          </Link>
          <ChevronRight className='h-4 w-4 mx-1.5' />
          <span className='text-foreground font-medium'>
            {t('compare.title', 'So sánh sản phẩm')}
          </span>
        </nav>

        {isLoading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className='w-8 h-8 animate-spin text-red-500' />
          </div>
        ) : (
          <div className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto'>
            {/* Thêm table-fixed và min-w-[900px] để bảng không bị bóp */}
            <table className='w-full text-left border-collapse table-fixed min-w-[900px]'>
              <thead>
                <tr>
                  {/* Cố định cột đầu tiên không cho co lại */}
                  <th className='w-[240px] min-w-[240px] p-4 border-b border-r bg-slate-50 text-slate-600 font-bold align-top'>
                    {t('compare.basicInfo', 'Thông tin cơ bản')}
                  </th>
                  {products.map((p) => {
                    const discountAmount = p.originalPrice - p.price
                    const discountPercent =
                      discountAmount > 0 ? Math.round((discountAmount / p.originalPrice) * 100) : 0

                    return (
                      <th
                        key={p.id}
                        /* Bỏ w-1/3, thêm min-w-[250px] để các cột tự chia đều không gian */
                        className='p-4 border-b border-slate-200 min-w-[250px] relative align-top'
                      >
                        <button
                          onClick={() => removeItem(p.slug!)}
                          className='absolute top-2 right-2 text-slate-400 hover:text-red-500 bg-slate-100 rounded-full p-1 z-10'
                        >
                          <X className='w-4 h-4' />
                        </button>
                        <div className='flex flex-col items-center text-center gap-3'>
                          <img src={p.images?.[0]} alt={p.name} className='h-40 object-contain' />
                          <Link
                            to={`/product/${p.slug}`}
                            className='font-bold text-slate-800 hover:text-blue-600 line-clamp-2'
                          >
                            {p.name}
                          </Link>

                          {/* Logic hiển thị 2 loại giá */}
                          <div className='flex flex-col items-center'>
                            <div className='text-red-600 font-extrabold text-xl'>
                              {formatVnd(p.price)}
                            </div>
                            {discountAmount > 0 && (
                              <div className='flex items-center gap-2 mt-1'>
                                <span className='text-sm text-slate-400 line-through font-medium'>
                                  {formatVnd(p.originalPrice)}
                                </span>
                                <span className='text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded'>
                                  -{discountPercent}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Dòng đánh giá */}
                <tr>
                  <td className='w-[240px] min-w-[240px] p-4 border-b border-r bg-slate-50 font-semibold text-sm'>
                    {t('compare.rating', 'Đánh giá')}
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className='p-4 border-b border-slate-100 text-center'>
                      <div className='flex items-center justify-center gap-1 font-bold text-amber-500'>
                        {p.rating.toFixed(1)} <Star className='w-4 h-4 fill-current' />
                      </div>
                      <div className='text-xs text-slate-500 mt-1'>
                        {t('compare.reviewsCount', { count: p.reviews })}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Các dòng thông số kỹ thuật (Duyệt mảng Set Labels đã gom) */}
                {allSpecLabels.map((label, idx) => (
                  <tr key={idx} className='hover:bg-slate-50 transition-colors'>
                    {/* Cố định kích thước cột label */}
                    <td className='w-[240px] min-w-[240px] p-4 border-b border-r bg-slate-50/50 font-semibold text-sm text-slate-700 break-words'>
                      {label}
                    </td>
                    {products.map((p) => {
                      const spec = p.specs?.find((s) => s.label === label)
                      return (
                        <td
                          key={p.id}
                          className='p-4 border-b border-slate-100 text-sm text-slate-600'
                        >
                          {spec ? spec.value : <span className='text-slate-300'>-</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
