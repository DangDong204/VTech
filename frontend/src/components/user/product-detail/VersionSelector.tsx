import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface VersionSelectorProps {
  versions: string[]
  selectedVersion: string
  onSelect: (version: string) => void
}

export function VersionSelector({ versions, selectedVersion, onSelect }: VersionSelectorProps) {
  const { t } = useTranslation('common')

  if (!versions || versions.length === 0) return null

  return (
    <div className='space-y-2'>
      <h3 className='text-sm font-medium text-slate-700'>{t('productDetail.version')}</h3>
      <div className='flex flex-wrap gap-2.5'>
        {versions.map((version) => {
          const isSelected = selectedVersion === version

          return (
            <button
              key={version}
              onClick={() => onSelect(version)}
              className={cn(
                'relative flex items-center justify-center border rounded-lg px-4 py-2 text-sm font-medium transition-all bg-white min-w-[80px] overflow-hidden',
                isSelected
                  ? 'border-red-500 text-red-600 bg-red-50/30'
                  : 'border-border text-slate-700 hover:border-slate-400'
              )}
            >
              {version}

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
