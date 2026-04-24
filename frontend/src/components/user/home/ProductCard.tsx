import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ClientProductResponse } from '@/services/product/client-product.type'
import { ImageIcon, ShoppingCart, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫'
}

export function ProductCard({ product }: { product: ClientProductResponse }) {
  const { t } = useTranslation('common')
  const filled = Math.round(product.rating || 0)

  const uniqueVersions = useMemo(() => {
    if (!product.variants) return []
    return Array.from(new Set(product.variants.map((v) => v.version)))
  }, [product.variants])

  const uniqueColors = useMemo(() => {
    if (!product.variants) return []
    const colors = new Map()
    product.variants.forEach((v) => {
      if (!colors.has(v.colorHex)) {
        colors.set(v.colorHex, v.color)
      }
    })
    return Array.from(colors.entries()).map(([hex, name]) => ({ hex, name }))
  }, [product.variants])

  const [selectedVersion, setSelectedVersion] = useState(uniqueVersions[0])
  const [selectedColor, setSelectedColor] = useState(uniqueColors[0]?.hex)

  const currentVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null
    return (
      product.variants.find((v) => v.version === selectedVersion && v.colorHex === selectedColor) ||
      product.variants.find((v) => v.version === selectedVersion) ||
      product.variants[0]
    )
  }, [product.variants, selectedVersion, selectedColor])

  // 🛑 BƯỚC PHÒNG THỦ: Nếu sản phẩm chưa có biến thể nào trong DB
  if (!currentVariant) {
    return (
      <div className='bg-card rounded-xl border border-border p-3 flex flex-col transition-all duration-300 relative h-full opacity-60'>
        <div className='relative w-full aspect-square flex items-center justify-center p-4 mt-4'>
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.baseName}
              className='h-full w-full object-contain grayscale'
            />
          ) : (
            <ImageIcon className='h-12 w-12 text-muted-foreground/20' />
          )}
        </div>
        <div className='flex flex-col gap-1 mt-2'>
          <h3 className='text-sm font-semibold text-foreground line-clamp-2 min-h-[40px]'>
            {product.baseName}
          </h3>
          <div className='text-sm font-medium text-muted-foreground mt-1'>Đang cập nhật...</div>
        </div>
      </div>
    )
  }

  // Nếu có currentVariant, tính toán bình thường
  const discountAmount = currentVariant.originalPrice - currentVariant.price

  return (
    <div className='group bg-card rounded-xl border border-border p-3 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/40 relative h-full'>
      <Link to={`/product/${product.slug}`} className='cursor-pointer'>
        {/* Nút yêu thích / Trả góp */}
        <div className='absolute top-3 left-3 z-10'>
          <Badge
            variant='secondary'
            className='bg-blue-200 text-blue-600 font-medium text-[10px] px-1.5 py-1'
          >
            Trả góp 0%
          </Badge>
        </div>

        {/* Ảnh */}
        <div className='relative w-full aspect-square flex items-center justify-center p-4 mt-4'>
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.baseName}
              className='h-full w-full object-contain group-hover:-translate-y-1.5 transition-transform duration-300'
            />
          ) : (
            <ImageIcon className='h-12 w-12 text-muted-foreground/20' />
          )}
        </div>
      </Link>

      {/* Tên & Giá */}
      <div className='flex flex-col gap-1 mt-2'>
        <h3 className='text-sm font-semibold text-foreground line-clamp-2 min-h-[40px]'>
          {product.baseName} {currentVariant.version}
        </h3>

        <div className='flex flex-col mt-1'>
          {discountAmount > 0 ? (
            <div className='flex items-center gap-2'>
              <span className='text-base font-bold text-destructive'>
                {formatVnd(currentVariant.price)}
              </span>
              <Badge
                variant='outline'
                className='text-[9px] px-1 py-0 h-4 border-destructive text-destructive bg-destructive/10 rounded-sm font-medium'
              >
                -{Math.round((discountAmount / currentVariant.originalPrice) * 100)}%
              </Badge>
            </div>
          ) : (
            <span className='text-base font-bold text-foreground'>
              {formatVnd(currentVariant.price)}
            </span>
          )}

          <div className='text-[11px] text-muted-foreground line-through h-4'>
            {discountAmount > 0 ? formatVnd(currentVariant.originalPrice) : ''}
          </div>
        </div>
      </div>

      {/* Tùy chọn (Màu & Dung lượng) */}
      <div className='mt-2 space-y-2.5'>
        {/* Màu sắc */}
        <div className='flex gap-1.5 items-center'>
          {uniqueColors.map((color) => (
            <button
              key={color.hex}
              title={color.name}
              onClick={() => setSelectedColor(color.hex)}
              className={`w-4 h-4 rounded-full border ring-offset-1 transition-all ${
                selectedColor === color.hex
                  ? 'border-primary ring-1 ring-primary ring-offset-background'
                  : 'border-border hover:border-muted-foreground'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>

        {/* Phiên bản */}
        <div className='flex flex-wrap gap-1.5'>
          {uniqueVersions.map((version) => {
            const isSelected = selectedVersion === version
            return (
              <div
                key={version}
                onClick={() => setSelectedVersion(version)}
                className={`relative border rounded px-1.5 py-0.5 text-[10px] font-medium cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-red-500 text-foreground bg-red-50/50 dark:bg-red-950/20'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {version}
                {isSelected && (
                  <div className='absolute top-0 right-0 w-0 h-0 border-t-[10px] border-t-red-500 border-l-[10px] border-l-transparent rounded-tr-sm'>
                    <svg
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='4'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='absolute -top-[10px] right-[0px] w-2 h-2 text-white'
                    >
                      <polyline points='20 6 9 17 4 12'></polyline>
                    </svg>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className='mt-auto pt-3 flex items-center justify-between'>
        <div className='flex items-center gap-0.5'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < filled ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
              }`}
            />
          ))}
          <span className='ml-1 text-[10px] text-muted-foreground'>({product.reviews})</span>
        </div>
        <Button
          size='icon'
          variant='secondary'
          aria-label={t('product.addToCart')}
          className='h-7 w-7 text-primary hover:bg-primary hover:text-primary-foreground rounded-full'
        >
          <ShoppingCart className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  )
}
