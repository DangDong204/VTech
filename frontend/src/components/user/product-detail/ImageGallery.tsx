import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const mainRef = useRef<HTMLDivElement>(null)
  const thumbListRef = useRef<HTMLDivElement>(null)

  if (!images || images.length === 0) {
    return (
      <div className='aspect-square bg-muted rounded-xl flex items-center justify-center text-muted-foreground'>
        Chưa có ảnh
      </div>
    )
  }

  const handlePrev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length)
  const handleNext = () => setActiveIndex((i) => (i + 1) % images.length)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return
    const rect = mainRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  const scrollThumb = (dir: 'up' | 'down') => {
    if (!thumbListRef.current) return
    thumbListRef.current.scrollBy({ top: dir === 'up' ? -100 : 100, behavior: 'smooth' })
  }

  return (
    <div className='flex gap-3 select-none'>
      {/* Cột thumbnail dọc bên trái - FPT Shop style */}
      <div className='flex flex-col items-center gap-1 w-[72px] shrink-0'>
        <button
          onClick={() => scrollThumb('up')}
          className='w-full flex items-center justify-center py-1 text-muted-foreground hover:text-foreground transition-colors'
        >
          <ChevronLeft className='h-4 w-4 rotate-90' />
        </button>

        <div
          ref={thumbListRef}
          className='flex flex-col gap-1.5 overflow-y-auto max-h-[440px] scroll-smooth'
          style={{ scrollbarWidth: 'none' }}
        >
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'relative w-[68px] h-[68px] shrink-0 rounded-lg border-2 overflow-hidden bg-white transition-all duration-200',
                activeIndex === index
                  ? 'border-red-500 shadow-sm shadow-red-200'
                  : 'border-transparent hover:border-gray-300'
              )}
            >
              <img
                src={img}
                alt=''
                className='w-full h-full object-contain p-1'
                draggable={false}
              />
              {activeIndex === index && (
                <div className='absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none' />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollThumb('down')}
          className='w-full flex items-center justify-center py-1 text-muted-foreground hover:text-foreground transition-colors'
        >
          <ChevronLeft className='h-4 w-4 -rotate-90' />
        </button>
      </div>

      {/* Ảnh chính */}
      <div className='flex-1 flex flex-col gap-2'>
        <div
          ref={mainRef}
          className={cn(
            'relative aspect-square rounded-xl border border-gray-100 bg-white overflow-hidden flex items-center justify-center group cursor-crosshair'
          )}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={images[activeIndex]}
            alt={productName}
            className='w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-105'
            draggable={false}
          />

          {/* Zoom indicator */}
          <div className='absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
            <ZoomIn className='h-4 w-4 text-gray-500' />
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10'
              >
                <ChevronLeft className='h-5 w-5 text-gray-600' />
              </button>
              <button
                onClick={handleNext}
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10'
              >
                <ChevronRight className='h-5 w-5 text-gray-600' />
              </button>
            </>
          )}

          {/* Zoom overlay lens */}
          {isZoomed && (
            <div
              className='absolute inset-0 pointer-events-none'
              style={{
                backgroundImage: `url(${images[activeIndex]})`,
                backgroundSize: '250%',
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundRepeat: 'no-repeat',
                opacity: 0
              }}
            />
          )}
        </div>

        {/* Chỉ số ảnh */}
        <div className='flex justify-center gap-1.5 py-1'>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'rounded-full transition-all duration-200',
                i === activeIndex
                  ? 'w-5 h-1.5 bg-red-500'
                  : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
