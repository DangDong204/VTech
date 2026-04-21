import { Star, ShoppingCart, ImageIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export interface Product {
  id: string
  name: string
  price: number
  originalPrice: number
  rating: number
  reviews: number
  discount: number
  hue: number
  image?: string
}

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation('common')
  const filled = Math.round(product.rating)

  return (
    <div className='group bg-card rounded-lg border border-border overflow-hidden flex flex-col transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 hover:border-primary/30'>
      {/* Image */}
      <div
        className='relative aspect-square flex items-center justify-center overflow-hidden bg-white p-2'
        style={
          !product.image
            ? {
                background: `linear-gradient(135deg, oklch(0.96 0.04 ${product.hue}), oklch(0.92 0.06 ${product.hue}))`
              }
            : undefined
        }
      >
        {/* BƯỚC 2: Render ảnh thật nếu có, nếu không thì dùng Icon mặc định */}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className='h-full w-full object-contain group-hover:scale-105 transition-transform duration-300'
          />
        ) : (
          <ImageIcon className='h-12 w-12 text-foreground/20 group-hover:scale-110 transition-transform duration-300' />
        )}

        {product.discount > 0 && (
          <span className='absolute top-2 left-2 bg-red-500 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded z-10'>
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Body */}
      <div className='p-3 flex flex-col flex-1 gap-2'>
        <h3 className='text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem] leading-snug'>
          {product.name}
        </h3>

        <div className='space-y-0.5'>
          <div className='text-base font-bold text-primary'>{formatVnd(product.price)}</div>
          {product.originalPrice > product.price && (
            <div className='text-xs text-muted-foreground line-through'>
              {formatVnd(product.originalPrice)}
            </div>
          )}
        </div>

        <div className='mt-auto flex items-center justify-between gap-2 pt-1.5 border-t border-border'>
          <div className='flex items-center gap-0.5'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < filled ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                }`}
              />
            ))}
            <span className='ml-1 text-[10px] text-muted-foreground'>({product.reviews})</span>
          </div>
          <Button
            size='icon'
            variant='ghost'
            aria-label={t('product.addToCart')}
            className='h-7 w-7 text-primary hover:bg-primary hover:text-primary-foreground'
          >
            <ShoppingCart className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>
    </div>
  )
}
