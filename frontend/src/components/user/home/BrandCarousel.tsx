import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllBrandApi } from '@/services/brand/brand.api'

export function BrandCarousel() {
  const { t } = useTranslation('common')

  // Lấy danh sách thương hiệu từ API Backend
  const { data: brands = [], isLoading } = useFetchData('brands', getAllBrandApi)

  // Cắt lấy tối đa 10 thương hiệu đầu tiên (nổi bật nhất)
  const displayBrands = brands.slice(0, 10)

  return (
    <section className='bg-white rounded-2xl border border-border/50 p-4 sm:p-6 shadow-sm'>
      <div className='flex items-center justify-between mb-4 sm:mb-6'>
        <h2 className='text-lg sm:text-xl font-bold text-slate-800'>{t('brands.title')}</h2>
      </div>

      <div className='overflow-x-auto scrollbar-thin -mx-2 px-2 pb-2'>
        <div className='flex lg:grid lg:grid-cols-5 gap-3 sm:gap-4 min-w-max lg:min-w-0'>
          {isLoading ? (
            // Hiệu ứng Loading
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className='h-16 sm:h-20 w-32 lg:w-auto bg-slate-100 rounded-xl animate-pulse'
              ></div>
            ))
          ) : displayBrands.length > 0 ? (
            // Render danh sách thương hiệu thật
            displayBrands.map((brand) => (
              <Link
                key={brand.id}
                to={`/products?brandSlug=${brand.slug}`}
                // 1. ĐỔI h-20 thành h-24 (cao hơn), ĐỔI p-4 thành p-2 (viền mỏng hơn để ảnh to ra)
                className='group flex items-center justify-center h-20 sm:h-24 w-32 lg:w-auto bg-white border border-border/60 rounded-xl transition-all duration-300 hover:border-red-500 hover:shadow-lg cursor-pointer overflow-hidden p-2 sm:p-2'
              >
                {brand.brandLogo ? (
                  <img
                    src={brand.brandLogo}
                    alt={brand.brandName}
                    // 2. THÊM w-full h-full để ảnh ép bung ra sát viền padding, object-contain giữ đúng tỷ lệ
                    className='w-full h-full object-contain transition-transform duration-300 group-hover:scale-110'
                  />
                ) : (
                  <span className='text-sm sm:text-base font-bold text-slate-500 transition-all duration-300 group-hover:text-red-600 group-hover:scale-110'>
                    {brand.brandName}
                  </span>
                )}
              </Link>
            ))
          ) : (
            // Fallback khi DB trống
            <div className='col-span-full py-6 text-center text-sm text-muted-foreground italic bg-slate-50 rounded-xl'>
              Chưa có thương hiệu nào.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
