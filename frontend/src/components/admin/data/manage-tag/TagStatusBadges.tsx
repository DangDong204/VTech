import { colorMap } from '@/defines/colorMap'
import type { TagStatus } from '@/defines/enum/tag.enum'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface TagStatusBadgeProps {
  status?: TagStatus
}

export function TagStatusBadge({ status }: TagStatusBadgeProps) {
  const { t } = useTranslation('tag')

  if (!status) return <span>-</span>

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium w-fit',
        colorMap[status]
      )}
    >
      {t(`fields.status.options.${status}`, status)}
    </span>
  )
}
