import { useTranslation } from 'react-i18next'

interface ProductDescriptionProps {
  content: string
}

export function ProductDescription({ content }: ProductDescriptionProps) {
  const { t } = useTranslation('common')

  return (
    <div className='bg-card border border-border rounded-lg p-4 sm:p-6'>
      <h2 className='text-lg font-bold mb-4'>{t('productDetail.features')}</h2>
      <div className='text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base'>
        {content}
      </div>
    </div>
  )
}
