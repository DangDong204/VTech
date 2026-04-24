import { useState } from 'react'
import { Star, User, Send, ThumbsUp } from 'lucide-react'
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

// Rating bar row
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className='flex items-center gap-2 text-sm'>
      <span className='w-2 text-right text-slate-500 shrink-0'>{star}</span>
      <Star className='h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0' />
      <div className='flex-1 h-2 bg-slate-100 rounded-full overflow-hidden'>
        <div
          className='h-full bg-amber-400 rounded-full transition-all duration-500'
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='w-7 text-right text-xs text-slate-400 shrink-0'>{count}</span>
    </div>
  )
}

export function ProductReviews({ ratingAvg, totalReviews, reviews }: ProductReviewsProps) {
  const { t } = useTranslation('common')
  const [newRating, setNewRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [newContent, setNewContent] = useState('')
  const [activeFilter, setActiveFilter] = useState<number | null>(null)

  // Tính distribution (mock nếu chưa có reviews thật)
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach((r) => {
    const s = Math.min(5, Math.max(1, Math.round(r.rating)))
    dist[s] = (dist[s] || 0) + 1
  })

  const filteredReviews = activeFilter
    ? reviews.filter((r) => Math.round(r.rating) === activeFilter)
    : reviews

  const STAR_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc']

  const handleSubmit = () => {
    if (newRating === 0) {
      toast.error(t('productDetail.errorNoStar'))
      return
    }
    if (!newContent.trim()) {
      toast.error(t('productDetail.errorNoContent'))
      return
    }
    toast.success(t('productDetail.reviewSuccess'))
    setNewRating(0)
    setNewContent('')
  }

  return (
    <div>
      <h2 className='text-xl font-bold mb-5 pb-3 border-b border-border/50'>Đánh giá & Nhận xét</h2>

      {/* ---- Tổng quan rating ---- */}
      <div className='flex gap-6 mb-6 p-5 bg-amber-50 rounded-2xl border border-amber-100'>
        {/* Điểm lớn */}
        <div className='flex flex-col items-center justify-center min-w-[90px]'>
          <span className='text-5xl font-black text-amber-500 leading-none'>
            {ratingAvg > 0 ? ratingAvg.toFixed(1) : '–'}
          </span>
          <span className='text-amber-400 text-xs mt-1'>trên 5</span>
          <div className='flex items-center gap-0.5 mt-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(ratingAvg) ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`}
              />
            ))}
          </div>
          <span className='text-xs text-slate-500 mt-1'>{totalReviews} đánh giá</span>
        </div>

        {/* Bars */}
        <div className='flex-1 flex flex-col gap-1.5 justify-center'>
          {[5, 4, 3, 2, 1].map((s) => (
            <RatingBar key={s} star={s} count={dist[s] || 0} total={totalReviews} />
          ))}
        </div>
      </div>

      {/* ---- Bộ lọc nhanh ---- */}
      <div className='flex gap-2 flex-wrap mb-6'>
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeFilter === null
              ? 'bg-red-500 text-white border-red-500'
              : 'border-border hover:border-red-300 text-slate-600'
          }`}
        >
          Tất cả ({totalReviews})
        </button>
        {[5, 4, 3, 2, 1].map((s) => (
          <button
            key={s}
            onClick={() => setActiveFilter(activeFilter === s ? null : s)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeFilter === s
                ? 'bg-amber-400 text-white border-amber-400'
                : 'border-border hover:border-amber-300 text-slate-600'
            }`}
          >
            {s}
            <Star className='h-3 w-3 fill-current' />
            <span className='text-xs opacity-75'>({dist[s] || 0})</span>
          </button>
        ))}
      </div>

      {/* ---- Danh sách reviews ---- */}
      <div className='space-y-4 mb-8'>
        {filteredReviews.length === 0 ? (
          <div className='text-center py-10 text-slate-400 text-sm'>
            <Star className='h-10 w-10 mx-auto mb-2 text-slate-200' />
            Chưa có đánh giá nào. Hãy là người đầu tiên!
          </div>
        ) : (
          filteredReviews.map((rv) => (
            <div
              key={rv.id}
              className='flex gap-3 p-4 bg-white rounded-xl border border-border/60 hover:border-border transition-colors'
            >
              <div className='h-10 w-10 shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600'>
                <User className='h-5 w-5' />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between gap-2 flex-wrap mb-1'>
                  <span className='font-semibold text-sm text-foreground'>{rv.userName}</span>
                  <span className='text-xs text-muted-foreground'>{rv.date}</span>
                </div>
                <div className='flex items-center gap-1 mb-2'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < rv.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                  <span className='text-xs text-amber-600 ml-1 font-medium'>
                    {STAR_LABELS[Math.round(rv.rating)]}
                  </span>
                </div>
                <p className='text-sm text-foreground leading-relaxed'>{rv.content}</p>
                <button className='flex items-center gap-1 mt-2 text-xs text-slate-400 hover:text-blue-500 transition-colors'>
                  <ThumbsUp className='h-3 w-3' /> Hữu ích
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ---- Form viết đánh giá ---- */}
      <div className='bg-slate-50 rounded-2xl border border-border p-5'>
        <h3 className='font-bold text-base mb-4'>Viết đánh giá của bạn</h3>

        <div className='flex items-center gap-3 mb-4'>
          <span className='text-sm text-slate-500 shrink-0'>Chất lượng sản phẩm</span>
          <div className='flex items-center gap-1'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setNewRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className='focus:outline-none transition-transform hover:scale-125'
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= (hoverRating || newRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          {(hoverRating || newRating) > 0 && (
            <span className='text-sm font-medium text-amber-600'>
              {STAR_LABELS[hoverRating || newRating]}
            </span>
          )}
        </div>

        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder='Chia sẻ trải nghiệm thực tế của bạn về sản phẩm này...'
          className='flex min-h-[100px] w-full rounded-xl border border-input bg-white px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 mb-3 resize-none'
        />

        <Button
          onClick={handleSubmit}
          className='gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl'
        >
          <Send className='h-4 w-4' />
          Gửi đánh giá
        </Button>
      </div>
    </div>
  )
}
