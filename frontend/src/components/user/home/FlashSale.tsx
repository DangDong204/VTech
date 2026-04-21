import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Zap } from 'lucide-react'
import { ProductCard, type Product } from './ProductCard'

const flashProducts: Product[] = [
  {
    id: 'f1',
    name: 'OPPO A6 Pro (Màu Hồng)', // Đổi tên cho khớp với ảnh
    price: 8990000,
    originalPrice: 10990000,
    rating: 5,
    reviews: 1240,
    discount: 18,
    hue: 270,
    // BỔ SUNG LINK ẢNH VÀO ĐÂY:
    image:
      'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/oppo-a6-pro/oppo-a6-pro-hong-1.webp'
  },
  {
    id: 'f2',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    price: 25490000,
    originalPrice: 31990000,
    rating: 5,
    reviews: 890,
    discount: 20,
    hue: 230,
    image:
      'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/oppo-reno13f/oppo-reno13f-purple-1.webp'
  },
  {
    id: 'f3',
    name: 'MacBook Air M3 13-inch 8GB/256GB',
    price: 25990000,
    originalPrice: 28990000,
    rating: 5,
    reviews: 540,
    discount: 10,
    hue: 210,
    image:
      'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/samsung-galaxy-zfold7/samsung-galaxy-zfold7-navy-1.webp'
  },
  {
    id: 'f4',
    name: 'AirPods Pro 2 USB-C Active Noise Cancellation',
    price: 4990000,
    originalPrice: 6790000,
    rating: 4,
    reviews: 2100,
    discount: 27,
    hue: 200,
    image:
      'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/iphone-16-plus/iphone-16-plus-hong-1.webp'
  },
  {
    id: 'f5',
    name: 'Apple Watch Series 10 GPS 42mm',
    price: 9490000,
    originalPrice: 11990000,
    rating: 5,
    reviews: 320,
    discount: 21,
    hue: 350,
    image:
      'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/iphone-16-plus/iphone-16-plus-trang-1.webp'
  },
  {
    id: 'f6',
    name: 'Xiaomi 14T Pro 12GB/512GB Global',
    price: 14990000,
    originalPrice: 18990000,
    rating: 4,
    reviews: 670,
    discount: 21,
    hue: 30,
    image:
      'https://vtech-image-ndd.s3.ap-southeast-2.amazonaws.com/product/iphone-16-plus/iphone-16-plus-den-1.webp'
  }
]

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function CountdownBox({ value }: { value: string }) {
  return (
    <span className='inline-flex h-7 min-w-7 px-1.5 items-center justify-center rounded bg-foreground text-background text-xs font-bold tabular-nums'>
      {value}
    </span>
  )
}

export function FlashSale() {
  const { t } = useTranslation('common')
  const [seconds, setSeconds] = useState(2 * 3600 + 15 * 60 + 30)

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return (
    <section
      className='rounded-xl p-4 sm:p-5'
      style={{
        background: 'linear-gradient(135deg, oklch(0.95 0.06 35 / 0.7), oklch(0.93 0.08 60 / 0.5))'
      }}
    >
      <div className='flex items-center justify-between gap-3 mb-4 flex-wrap'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1.5 bg-red-500 text-primary-foreground px-3 py-1.5 rounded-md font-bold text-sm sm:text-base shadow-sm'>
            <Zap className='h-4 w-4 fill-current' />
            {t('home.flashSale')}
          </div>
          <div className='flex items-center gap-1.5 text-sm'>
            <span className='text-muted-foreground hidden sm:inline'>{t('home.endsIn')}:</span>
            <CountdownBox value={pad(h)} />
            <span className='font-bold text-foreground'>:</span>
            <CountdownBox value={pad(m)} />
            <span className='font-bold text-foreground'>:</span>
            <CountdownBox value={pad(s)} />
          </div>
        </div>
      </div>

      {/* Horizontal scroll on mobile, grid on larger */}
      <div className='grid grid-flow-col auto-cols-[70%] sm:auto-cols-[40%] md:grid-flow-row md:auto-cols-auto md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0 -mx-1 px-1'>
        {flashProducts.map((p) => (
          <div key={p.id} className='snap-start'>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
