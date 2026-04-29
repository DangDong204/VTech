import { Badge } from '@/components/ui/badge'
import { ArticleStatus } from '@/defines/enum/article.enum'
import { useTranslation } from 'react-i18next'

interface Props {
  status: ArticleStatus
}

export function ArticleStatusBadge({ status }: Props) {
  const { t } = useTranslation('article')

  const getVariant = () => {
    switch (status) {
      case ArticleStatus.PUBLISHED:
        return 'success'
      case ArticleStatus.DRAFT:
        return 'secondary'
      case ArticleStatus.HIDDEN:
        return 'destructive'
      default:
        return 'default'
    }
  }

  return <Badge variant={getVariant() as any}>{t(`filters.status.${status}`)}</Badge>
}
