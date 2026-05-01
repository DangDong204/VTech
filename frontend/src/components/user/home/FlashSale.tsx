import { ProductSkeleton } from '@/components/common/ProductSkeleton'
import { getProductsByPromotionIdApi } from '@/services/product/client-product.api'
import { getClientActivePromotionsApi } from '@/services/promotion/promotion.api'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProductCard } from './ProductCard'
import { Zap, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

function pad(n: number) {
  return Number.isNaN(n) ? '00' : n.toString().padStart(2, '0')
}

function parseDateString(dateString: string | undefined): number {
  if (!dateString) return 0
  const parts = dateString.split(' ')
  if (parts.length !== 2) return new Date(dateString).getTime()
  const dateParts = parts[0].split('-')
  const timeParts = parts[1].split(':')
  if (dateParts.length !== 3 || timeParts.length !== 3) return new Date(dateString).getTime()
  const day = parseInt(dateParts[0], 10)
  const month = parseInt(dateParts[1], 10) - 1
  const year = parseInt(dateParts[2], 10)
  const hours = parseInt(timeParts[0], 10)
  const minutes = parseInt(timeParts[1], 10)
  const seconds = parseInt(timeParts[2], 10)
  return new Date(year, month, day, hours, minutes, seconds).getTime()
}

function CountdownBox({ value, textColor }: { value: string; textColor: string }) {
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded bg-white text-sm font-black tabular-nums shadow-sm ${textColor}`}
    >
      {value}
    </span>
  )
}

// Hook tính số cột hiển thị theo breakpoint
function useVisibleCount() {
  const [count, setCount] = useState(6)
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 640) setCount(2)
      else if (w < 768) setCount(3)
      else if (w < 1024) setCount(4)
      else if (w < 1280) setCount(5)
      else setCount(6)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return count
}

export function FlashSale() {
  const [now, setNow] = useState(new Date().getTime())
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [startIndex, setStartIndex] = useState(0)
  const visibleCount = useVisibleCount()

  const { data: promotions = [], isLoading: isLoadingPromos } = useQuery<PromotionResponse[]>({
    queryKey: ['active-promotions-list'],
    queryFn: getClientActivePromotionsApi
  })

  // FIX: Dùng derived state thay vì dùng useEffect để set tab mặc định
  const resolvedActiveTab = activeTab ?? (promotions.length > 0 ? promotions[0].id : null)

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['flash-sale-products', resolvedActiveTab],
    queryFn: () => getProductsByPromotionIdApi(resolvedActiveTab as string),
    enabled: !!resolvedActiveTab
  })

  useEffect(() => {
    const id = setInterval(() => setNow(new Date().getTime()), 1000)
    return () => clearInterval(id)
  }, [])

  if (isLoadingPromos) return null
  if (promotions.length === 0) return null

  const currentPromo = promotions.find((p) => p.id === resolvedActiveTab) || promotions[0]
  if (!currentPromo) return null

  const isUpcoming = parseDateString(currentPromo.startDate) > now
  const targetTime = isUpcoming
    ? parseDateString(currentPromo.startDate)
    : parseDateString(currentPromo.endDate)

  const diff = Math.max(0, Math.floor((targetTime - now) / 1000))
  const d = Math.floor(diff / 86400)
  const h = Math.floor((diff % 86400) / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60

  const theme = isUpcoming
    ? {
        bg: 'from-emerald-500 to-teal-400',
        textRed: 'text-emerald-700',
        icon: 'fill-emerald-100 text-emerald-100',
        badgeBg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
        badgePing: 'bg-emerald-400',
        badgeDot: 'bg-emerald-500',
        title: 'CHƯƠNG TRÌNH SẮP TỚI',
        label: 'Bắt đầu sau:',
        activeTabCls: 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-md scale-105',
        btnCls: 'bg-emerald-600 hover:bg-emerald-700 text-white'
      }
    : {
        bg: 'from-[#d92227] to-[#ff4b4b]',
        textRed: 'text-[#d92227]',
        icon: 'fill-yellow-400 text-yellow-400',
        badgeBg: 'bg-red-50 border-red-100 text-destructive',
        badgePing: 'bg-red-400',
        badgeDot: 'bg-red-500',
        title: 'KHUYẾN MÃI HOT',
        label: 'Kết thúc trong:',
        activeTabCls: 'bg-yellow-400 text-red-700 border-yellow-400 shadow-md scale-105',
        btnCls: 'bg-red-700 hover:bg-red-800 text-white'
      }

  // Slider logic
  const totalProducts = products.length

  const maxIndex = Math.max(0, totalProducts - visibleCount)
  const safeStartIndex = Math.min(startIndex, maxIndex)

  const canPrev = safeStartIndex > 0
  const canNext = safeStartIndex < maxIndex

  const handlePrev = () => setStartIndex((i) => Math.max(0, i - 1))
  const handleNext = () => setStartIndex((i) => Math.min(maxIndex, i + 1))

  const itemWidthCalc = `calc((100% - ${(visibleCount - 1) * 12}px) / ${visibleCount})`
  const transformCalc = `translateX(calc(-${safeStartIndex} * (100% / ${visibleCount} + 12px / ${visibleCount})))`

  return (
    <section
      className={`rounded-2xl overflow-hidden bg-gradient-to-r ${theme.bg} shadow-lg transition-colors duration-700`}
    >
      {/* HEADER */}
      <div className='p-4 sm:p-5 flex flex-col gap-4'>
        <div className='flex items-center gap-4 flex-wrap'>
          <h2 className='text-2xl sm:text-3xl font-black text-white italic flex items-center gap-2 drop-shadow-md uppercase'>
            {isUpcoming ? (
              <Clock className='h-8 w-8 text-white' />
            ) : (
              <Zap className={`h-8 w-8 ${theme.icon}`} />
            )}
            {theme.title}
          </h2>

          <div className='flex items-center gap-1.5 ml-auto md:ml-4'>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-sm border mr-2 ${theme.badgeBg}`}
            >
              <span className='relative flex h-3 w-3 mr-1'>
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.badgePing}`}
                />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${theme.badgeDot}`} />
              </span>
              {isUpcoming ? 'Sắp mở bán' : 'Đang diễn ra'}
            </div>

            <span className='text-white font-medium mr-1 uppercase text-sm hidden sm:inline'>
              {theme.label}
            </span>

            {d > 0 && (
              <>
                <CountdownBox value={pad(d)} textColor={theme.textRed} />
                <span className='font-bold text-white text-sm mr-1'>Ngày</span>
              </>
            )}
            <CountdownBox value={pad(h)} textColor={theme.textRed} />
            <span className='font-bold text-white'>:</span>
            <CountdownBox value={pad(m)} textColor={theme.textRed} />
            <span className='font-bold text-white'>:</span>
            <CountdownBox value={pad(s)} textColor={theme.textRed} />
          </div>
        </div>

        {/* TABS */}
        <div className='flex items-center gap-2 overflow-x-auto snap-x no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0'>
          {promotions.map((promo) => {
            const isPromoUpcoming = parseDateString(promo.startDate) > now
            return (
              <button
                key={promo.id}
                onClick={() => {
                  setActiveTab(promo.id)
                  setStartIndex(0) // FIX: Chuyển lệnh reset về đây thay vì dùng useEffect
                }}
                className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-all snap-start border flex items-center gap-1.5 ${
                  resolvedActiveTab === promo.id
                    ? theme.activeTabCls
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                {isPromoUpcoming && <Clock className='h-4 w-4' />}
                {promo.promotionName}
              </button>
            )
          })}
        </div>
      </div>

      {/* KHU VỰC SẢN PHẨM */}
      <div className='bg-background mx-2 mb-2 sm:mx-3 sm:mb-3 rounded-xl p-4 sm:p-5'>
        {/* FIX: Đổi 'group' thành 'group/slider' để cô lập hiệu ứng với ProductCard */}
        <div className='relative group/slider'>
          {/* NÚT PREV */}
          {!isLoadingProducts && totalProducts > visibleCount && (
            <button
              onClick={handlePrev}
              disabled={!canPrev}
              aria-label='Sản phẩm trước'
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all duration-300
                ${canPrev ? `${theme.btnCls} opacity-0 group-hover/slider:opacity-100 hover:scale-110 cursor-pointer` : 'bg-gray-200 text-gray-400 opacity-0 pointer-events-none'}`}
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
          )}

          {/* VÙNG CHỨA THANH TRƯỢT */}
          <div className='overflow-hidden px-1 py-2 -mx-1'>
            <div
              className='flex gap-3 transition-transform duration-500 ease-out'
              style={{ transform: transformCalc }}
            >
              {isLoadingProducts ? (
                Array.from({ length: visibleCount }).map((_, i) => (
                  <div key={i} className='shrink-0' style={{ width: itemWidthCalc }}>
                    <ProductSkeleton />
                  </div>
                ))
              ) : products.length > 0 ? (
                products.map((p) => (
                  <div
                    key={p.id}
                    className='shrink-0 h-full relative'
                    style={{ width: itemWidthCalc }}
                  >
                    <ProductCard product={p} />
                  </div>
                ))
              ) : (
                <div className='w-full py-12 text-center flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200'>
                  {isUpcoming ? (
                    <Clock className='h-12 w-12 text-slate-300 mb-3' />
                  ) : (
                    <Zap className='h-12 w-12 text-slate-300 mb-3' />
                  )}
                  <p className='text-slate-500 font-medium'>
                    Đang tải dữ liệu sản phẩm của chương trình...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* NÚT NEXT */}
          {!isLoadingProducts && totalProducts > visibleCount && (
            <button
              onClick={handleNext}
              disabled={!canNext}
              aria-label='Sản phẩm tiếp theo'
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all duration-300
                ${canNext ? `${theme.btnCls} opacity-0 group-hover/slider:opacity-100 hover:scale-110 cursor-pointer` : 'bg-gray-200 text-gray-400 opacity-0 pointer-events-none'}`}
            >
              <ChevronRight className='h-5 w-5' />
            </button>
          )}
        </div>

        {/* CHỈ BÁO VỊ TRÍ (dots) */}
        {!isLoadingProducts && totalProducts > visibleCount && (
          <div className='flex justify-center gap-1.5 mt-2'>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStartIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === safeStartIndex
                    ? `w-5 ${theme.btnCls}`
                    : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Trang ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
