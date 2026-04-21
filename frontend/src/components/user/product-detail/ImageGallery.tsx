import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className='aspect-square bg-muted rounded-lg flex items-center justify-center'>
        No Image
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Ảnh chính */}
      <div className='aspect-square rounded-lg border border-border overflow-hidden bg-white p-4 flex items-center justify-center'>
        <img
          src={images[activeIndex]}
          alt={productName}
          className='w-full h-full object-contain mix-blend-multiply'
        />
      </div>

      {/* Danh sách ảnh nhỏ */}
      <div className='flex gap-2 overflow-x-auto pb-2'>
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-md border-2 overflow-hidden bg-white p-1',
              activeIndex === index ? 'border-primary' : 'border-transparent hover:border-border'
            )}
          >
            <img src={img} alt='' className='w-full h-full object-contain mix-blend-multiply' />
          </button>
        ))}
      </div>
    </div>
  )
}
