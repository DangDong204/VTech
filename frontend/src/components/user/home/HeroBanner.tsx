import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Sparkles, CreditCard } from 'lucide-react'

export function HeroBanner() {
  const { t } = useTranslation('common')
  const [index, setIndex] = useState(0)

  const slides = [
    {
      title: t('banners.slide1Title'),
      sub: t('banners.slide1Sub'),
      gradient: 'linear-gradient(135deg, oklch(0.55 0.2 270), oklch(0.4 0.15 290))'
    },
    {
      title: t('banners.slide2Title'),
      sub: t('banners.slide2Sub'),
      gradient: 'linear-gradient(135deg, oklch(0.5 0.2 25), oklch(0.35 0.15 15))'
    },
    {
      title: t('banners.slide3Title'),
      sub: t('banners.slide3Sub'),
      gradient: 'linear-gradient(135deg, oklch(0.55 0.18 195), oklch(0.4 0.15 220))'
    }
  ]

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(id)
  }, [slides.length])

  const next = () => setIndex((i) => (i + 1) % slides.length)
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 h-full'>
      {/* Main slider */}
      <div className='sm:col-span-2 relative rounded-lg overflow-hidden group min-h-[200px] sm:min-h-[280px] lg:min-h-[340px]'>
        {slides.map((s, i) => (
          <div
            key={i}
            className='absolute inset-0 transition-opacity duration-700 flex items-center'
            style={{
              background: s.gradient,
              opacity: i === index ? 1 : 0
            }}
          >
            <div className='px-6 sm:px-10 max-w-md text-primary-foreground'>
              <span className='inline-block text-xs font-semibold uppercase tracking-wider bg-white/15 backdrop-blur px-2.5 py-1 rounded'>
                Featured
              </span>
              <h2 className='mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight'>
                {s.title}
              </h2>
              <p className='mt-2 text-sm sm:text-base text-white/85'>{s.sub}</p>
            </div>
          </div>
        ))}

        {/* Controls */}
        <button
          onClick={prev}
          aria-label='Previous'
          className='absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/50'
        >
          <ChevronLeft className='h-5 w-5' />
        </button>
        <button
          onClick={next}
          aria-label='Next'
          className='absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/50'
        >
          <ChevronRight className='h-5 w-5' />
        </button>

        {/* Dots */}
        <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Side banners */}
      <div className='grid grid-cols-2 sm:grid-cols-1 gap-3'>
        <div
          className='relative rounded-lg overflow-hidden p-4 text-primary-foreground flex flex-col justify-between min-h-[110px] sm:min-h-0'
          style={{
            background: 'linear-gradient(135deg, oklch(0.55 0.22 35), oklch(0.45 0.2 20))'
          }}
        >
          <Sparkles className='h-6 w-6 opacity-90' />
          <p className='text-sm sm:text-base font-bold leading-snug'>{t('banners.sideBanner1')}</p>
        </div>
        <div
          className='relative rounded-lg overflow-hidden p-4 text-primary-foreground flex flex-col justify-between min-h-[110px] sm:min-h-0'
          style={{
            background: 'linear-gradient(135deg, oklch(0.5 0.18 250), oklch(0.35 0.15 270))'
          }}
        >
          <CreditCard className='h-6 w-6 opacity-90' />
          <p className='text-sm sm:text-base font-bold leading-snug'>{t('banners.sideBanner2')}</p>
        </div>
      </div>
    </div>
  )
}
