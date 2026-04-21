import { Button } from '@/components/ui/button'
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
    <div className='space-y-3'>
      <h3 className='text-sm font-medium'>{t('productDetail.version')}</h3>
      <div className='flex flex-wrap gap-2'>
        {versions.map((version) => (
          <Button
            key={version}
            variant={selectedVersion === version ? 'default' : 'outline'}
            onClick={() => onSelect(version)}
            className='min-w-[80px]'
          >
            {version}
          </Button>
        ))}
      </div>
    </div>
  )
}
