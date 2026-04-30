import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, EyeOff, MessageSquareQuote, MessageSquareOff } from 'lucide-react'
import type { ReviewResponse } from '@/services/review/review.type'

// Badge trạng thái hiển thị của Review
export function ReviewStatusBadge({ status }: { status: ReviewResponse['status'] }) {
  const { t } = useTranslation('review')

  const getBadgeConfig = () => {
    switch (status) {
      case 'APPROVED':
        return {
          className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          icon: <CheckCircle2 className='w-3 h-3 mr-1' />
        }
      case 'PENDING':
        return {
          className: 'bg-amber-50 text-amber-600 border-amber-200',
          icon: <Clock className='w-3 h-3 mr-1' />
        }
      case 'HIDDEN':
        return {
          className: 'bg-slate-50 text-slate-500 border-slate-200',
          icon: <EyeOff className='w-3 h-3 mr-1' />
        }
      default:
        return { className: 'bg-slate-50 text-slate-500', icon: null }
    }
  }

  const config = getBadgeConfig()

  return (
    <Badge variant='outline' className={`font-medium shadow-none ${config.className}`}>
      {config.icon}
      {t(`filters.status.${status}`)}
    </Badge>
  )
}

// Badge trạng thái phản hồi của Review
export function ReviewReplyStatusBadge({ hasReply }: { hasReply: boolean }) {
  const { t } = useTranslation('review')

  return hasReply ? (
    <Badge
      variant='outline'
      className='bg-blue-50 text-blue-600 border-blue-200 shadow-none font-medium'
    >
      <MessageSquareQuote className='w-3 h-3 mr-1' />
      {t('filters.replyStatus.replied')}
    </Badge>
  ) : (
    <Badge
      variant='outline'
      className='bg-slate-50 text-slate-400 border-slate-200 shadow-none font-medium'
    >
      <MessageSquareOff className='w-3 h-3 mr-1' />
      {t('filters.replyStatus.not_replied')}
    </Badge>
  )
}
