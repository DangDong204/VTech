import { useTranslation } from 'react-i18next'

const brands = [
  { name: 'Apple', className: 'font-semibold tracking-tight' },
  { name: 'Samsung', className: 'font-bold tracking-wide' },
  { name: 'Dell', className: 'font-extrabold italic' },
  { name: 'ASUS', className: 'font-black tracking-wider' },
  { name: 'Lenovo', className: 'font-bold' },
  { name: 'Sony', className: 'font-extrabold tracking-tight' },
  { name: 'LG', className: 'font-black tracking-widest' },
  { name: 'Xiaomi', className: 'font-semibold' },
  { name: 'HP', className: 'font-black tracking-wide' },
  { name: 'Acer', className: 'font-bold tracking-tight' }
]

export function BrandCarousel() {
  const { t } = useTranslation('common')
  return (
    <section className='bg-card rounded-lg border border-border p-4 sm:p-5'>
      <div className='flex items-center justify-between mb-3 sm:mb-4'>
        <h2 className='text-lg sm:text-xl font-bold text-foreground'>{t('brands.title')}</h2>
      </div>

      <div className='overflow-x-auto scrollbar-thin -mx-2 px-2'>
        <div className='flex lg:grid lg:grid-cols-5 gap-3 sm:gap-4 min-w-max lg:min-w-0'>
          {brands.map((b) => (
            <div
              key={b.name}
              className='group flex items-center justify-center h-16 sm:h-20 w-32 lg:w-auto bg-secondary/40 border border-border rounded-md transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-[var(--shadow-card-hover)] cursor-pointer'
            >
              <span
                className={`text-base sm:text-lg text-muted-foreground grayscale group-hover:grayscale-0 group-hover:text-primary transition-all duration-300 ${b.className}`}
              >
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
