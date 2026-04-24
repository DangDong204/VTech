import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const SLIDE_IMAGES = [
  'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/desk_header_be03084ec7.png',
  'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/sec1_content_D_fb68081cc6.png',
  'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/desk_header_1_2fe4e09ad0.png',
  'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/sec4_D_b257524125.png',
  'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/section4_D_3b93c0f891.png'
]

export function HeroBanner() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDE_IMAGES.length), 5000)
    return () => clearInterval(id)
  }, [])

  const next = () => setIndex((i) => (i + 1) % SLIDE_IMAGES.length)
  const prev = () => setIndex((i) => (i - 1 + SLIDE_IMAGES.length) % SLIDE_IMAGES.length)

  return (
    // Đã thay đổi: Bỏ min-h, dùng aspect-[2/1] cho mobile và aspect-[24/7] cho PC để tự động cân đối chiều cao
    <div className='w-full relative rounded-xl overflow-hidden group shadow-sm bg-white aspect-[2/1] md:aspect-[8/3] lg:aspect-[24/7]'>
      {/* MAIN SLIDER */}
      {SLIDE_IMAGES.map((imgUrl, i) => (
        <div
          key={i}
          className='absolute inset-0 transition-opacity duration-700'
          style={{
            opacity: i === index ? 1 : 0,
            zIndex: i === index ? 10 : 0
          }}
        >
          <Link to='/products' className='w-full h-full block'>
            <img
              src={imgUrl}
              alt={`Slide ${i + 1}`}
              // Đã thay đổi: object-fill giúp ảnh giãn vừa khít 100% khung mà không bị cắt xén bất kỳ chi tiết nào
              className='w-full h-full object-fill'
            />
          </Link>
        </div>
      ))}

      {/* Nút lùi/tới */}
      <button
        onClick={prev}
        className='absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/60 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-20 shadow-md'
      >
        <ChevronLeft className='h-6 w-6' />
      </button>
      <button
        onClick={next}
        className='absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/60 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-20 shadow-md'
      >
        <ChevronRight className='h-6 w-6' />
      </button>

      {/* Dấu chấm chuyển slide */}
      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20'>
        {SLIDE_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-8 bg-white shadow-sm' : 'w-2.5 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
