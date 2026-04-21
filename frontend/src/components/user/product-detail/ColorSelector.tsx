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
    <div className='space-y-3'>
      <h3 className='text-sm font-medium'>
        {t('productDetail.color')} <span className='font-bold text-primary'>{selectedColor}</span>
      </h3>
      <div className='flex flex-wrap gap-3'>
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => onSelect(color.name)}
            title={color.name}
            className={cn(
              'w-8 h-8 rounded-full border-2 ring-offset-2 transition-all',
              selectedColor === color.name
                ? 'border-primary ring-2 ring-primary'
                : 'border-border hover:scale-110'
            )}
            style={{ backgroundColor: color.hex }}
            aria-label={`Chọn màu ${color.name}`}
          />
        ))}
      </div>
    </div>
  )
}
