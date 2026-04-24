import { ProductSkeleton } from '@/components/common/ProductSkeleton'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllClientProductsApi } from '@/services/product/client-product.api'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProductCard } from './ProductCard'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function CountdownBox({ value }: { value: string }) {
  return (
    <span className='inline-flex h-7 min-w-7 px-1.5 items-center justify-center rounded bg-destructive text-destructive-foreground text-sm font-bold tabular-nums shadow-sm'>
      {value}
    </span>
  )
}

export function FlashSale() {
  const { t } = useTranslation('common')
  const [seconds, setSeconds] = useState(2 * 3600 + 15 * 60 + 30)

  const { data: products = [], isLoading } = useFetchData(
    'client-products',
    getAllClientProductsApi
  )

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return (
    <section className='rounded-2xl overflow-hidden bg-[#d92227] shadow-md'>
      {/* 1. KHU VỰC BANNER ẢNH (Phía trên cùng) */}
      <div className='w-full'>
        <img
          src='https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/Banner_1_7d2f49435c.png'
          alt='Giờ Vàng Mở Kho Triệu Deal'
          className='w-full h-auto object-cover min-h-[60px] md:min-h-[100px]'
        />
      </div>

      {/* 2. KHU VỰC NỘI DUNG (Khối trắng ôm trọn bên dưới giống FPT Shop) */}
      <div className='bg-background mx-2 mb-2 sm:mx-3 sm:mb-3 rounded-xl p-4 sm:p-5'>
        {/* Header đếm ngược */}
        <div className='flex items-center justify-between gap-3 mb-5 flex-wrap border-b border-border/50 pb-4'>
          <div className='flex items-center gap-4'>
            {/* Tag Đang diễn ra */}
            <div className='flex items-center gap-1.5 bg-red-50 text-destructive px-3 py-1.5 rounded-md font-bold text-sm sm:text-base border border-red-100'>
              <span className='relative flex h-3 w-3 mr-1'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-red-500'></span>
              </span>
              Đang diễn ra
            </div>

            {/* Đồng hồ đếm ngược */}
            <div className='flex items-center gap-1.5 text-sm'>
              <span className='text-muted-foreground hidden sm:inline font-medium mr-1'>
                {t('home.endsIn')}:
              </span>
              <CountdownBox value={pad(h)} />
              <span className='font-bold text-destructive'>:</span>
              <CountdownBox value={pad(m)} />
              <span className='font-bold text-destructive'>:</span>
              <CountdownBox value={pad(s)} />
            </div>
          </div>
        </div>

        {/* Lưới sản phẩm */}
        <div className='grid grid-flow-col auto-cols-[60%] sm:auto-cols-[35%] md:grid-flow-row md:auto-cols-auto md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0'>
          {isLoading
            ? // Hiển thị 6 cái skeleton khi đang tải
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='snap-start'>
                  <ProductSkeleton />
                </div>
              ))
            : // Render danh sách thật
              products.map((p) => (
                <div key={p.id} className='snap-start'>
                  <ProductCard product={p} />
                </div>
              ))}

          {/* Thông báo nếu DB trống */}
          {!isLoading && products.length === 0 && (
            <div className='col-span-full py-8 text-center text-muted-foreground bg-muted/20 rounded-lg'>
              Chưa có sản phẩm nào được mở bán.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
