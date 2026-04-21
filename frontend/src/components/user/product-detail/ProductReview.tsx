import { useState } from 'react'
import { Star, User, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export interface Review {
  id: string | number
  userName: string
  rating: number
  date: string
  content: string
}

interface ProductReviewsProps {
  ratingAvg: number
  totalReviews: number
  reviews: Review[]
}

export function ProductReviews({ ratingAvg, totalReviews, reviews }: ProductReviewsProps) {
  const { t } = useTranslation('common')
  const [newRating, setNewRating] = useState(0)
  const [newContent, setNewContent] = useState('')

  const handleSubmitReview = () => {
    if (newRating === 0) {
      toast.error(t('productDetail.errorNoStar'))
      return
    }
    if (!newContent.trim()) {
      // TODO: Sau này sẽ gọi API POST /api/v1/reviews ở đây
      toast.error(t('productDetail.errorNoContent'))
      return
    }
    toast.success(t('productDetail.reviewSuccess'))

    // Reset form sau khi gửi
    setNewRating(0)
    setNewContent('')
  }

  return (
    <div className='bg-card border border-border rounded-lg p-4 sm:p-6 mt-6'>
      <h2 className='text-lg font-bold mb-4'>{t('productDetail.customerReviews')}</h2>

      {/* 1. KHỐI TỔNG QUAN */}
      <div className='flex items-center gap-4 mb-6 pb-6 border-b border-border'>
        <div className='flex flex-col items-center justify-center'>
          <span className='text-4xl font-extrabold text-primary'>{ratingAvg}/5</span>
          <div className='flex items-center text-warning mt-1'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(ratingAvg) ? 'fill-current' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
          <span className='text-xs text-muted-foreground mt-1'>
            {t('productDetail.reviews', { count: totalReviews })}
          </span>
        </div>
      </div>

      {/* 2. KHỐI NHẬP ĐÁNH GIÁ MỚI */}
      <div className='mb-8 p-4 bg-muted/30 rounded-lg border border-border'>
        <h3 className='text-sm font-semibold mb-3'>{t('productDetail.writeReview')}</h3>

        <div className='flex items-center gap-2 mb-3'>
          <span className='text-sm text-muted-foreground'>{t('productDetail.rating')}</span>
          <div className='flex items-center gap-1'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setNewRating(star)}
                className='focus:outline-none transition-transform hover:scale-110'
              >
                <Star
                  className={`h-6 w-6 ${star <= newRating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Nhập nội dung */}
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder={t('productDetail.reviewPlaceholder')}
          className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary mb-3 resize-y'
        />

        <Button onClick={handleSubmitReview} className='w-full sm:w-auto gap-2'>
          <Send className='h-4 w-4' />
          {t('productDetail.sendReview')}
        </Button>
      </div>

      {/* 3. DANH SÁCH COMMENT CŨ */}
      <div className='space-y-6'>
        {reviews.map((rv) => (
          <div key={rv.id} className='flex gap-3'>
            <div className='h-10 w-10 shrink-0 bg-muted rounded-full flex items-center justify-center text-muted-foreground'>
              <User className='h-5 w-5' />
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-sm'>{rv.userName}</span>
                <span className='text-xs text-muted-foreground'>{rv.date}</span>
              </div>
              <div className='flex items-center text-warning my-1'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < rv.rating ? 'fill-current' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
              <p className='text-sm text-foreground'>{rv.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
