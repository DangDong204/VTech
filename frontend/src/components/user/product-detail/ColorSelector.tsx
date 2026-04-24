import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export interface ColorOption {
  name: string
  hex: string
}

interface ColorSelectorProps {
  colors: ColorOption[]
  selectedColor: string
  onSelect: (color: string) => void
}

export function ColorSelector({ colors, selectedColor, onSelect }: ColorSelectorProps) {
  const { t } = useTranslation('common')

  if (!colors || colors.length === 0) return null

  return (
    <div className='space-y-2'>
      <h3 className='text-sm font-medium text-slate-700'>
        {t('productDetail.color')}{' '}
        <span className='font-bold text-foreground'>{selectedColor}</span>
      </h3>
      <div className='flex flex-wrap gap-2.5'>
        {colors.map((color) => {
          const isSelected = selectedColor === color.name

          return (
            <button
              key={color.name}
              onClick={() => onSelect(color.name)}
              title={color.name}
              className={cn(
                'relative flex items-center gap-2 border rounded-lg px-3 py-2 text-sm font-medium transition-all bg-white overflow-hidden',
                isSelected
                  ? 'border-red-500 text-red-600 bg-red-50/30'
                  : 'border-border text-slate-700 hover:border-slate-400'
              )}
            >
              {/* Hình tròn hiển thị màu */}
              <span
                className='w-5 h-5 rounded-full border border-black/10 shadow-sm shrink-0'
                style={{ backgroundColor: color.hex }}
              />
              <span className='whitespace-nowrap'>{color.name}</span>

              {isSelected && (
                <div className='absolute top-0 right-0 w-0 h-0 border-t-[18px] border-t-red-500 border-l-[18px] border-l-transparent'>
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='4'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='absolute -top-[17px] right-[1px] w-2.5 h-2.5 text-white'
                  >
                    <polyline points='20 6 9 17 4 12'></polyline>
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
