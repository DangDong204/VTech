import { useState } from 'react'
import { Star, User, ThumbsUp, ShieldCheck, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProductReviewsApi, voteHelpfulReviewApi } from '@/services/review/review.api'
import type { ReviewResponse } from '@/services/review/review.type'
import { Dialog, DialogContent } from '@/components/ui/dialog' // Bổ sung import Dialog
import { useLocation, useNavigate } from 'react-router'
import type { AxiosError } from 'axios'

interface ProductReviewsProps {
  productId: string
}

// Rating bar row component
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

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [activeFilter, setActiveFilter] = useState<number | null>(null)

  // State quản lý việc phóng to Media (Ảnh/Video)
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string
    type: 'IMAGE' | 'VIDEO'
  } | null>(null)

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  // 1. Fetch dữ liệu đánh giá thực tế
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: () => getProductReviewsApi(productId),
    enabled: !!productId
  })

  // 2. Mutation cho nút "Hữu ích"
  const voteHelpfulMutation = useMutation({
    mutationFn: (reviewId: string) => voteHelpfulReviewApi(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] })
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      if (error.response?.status === 401) {
        toast.error('Vui lòng đăng nhập để thực hiện chức năng này.')
      } else {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra.')
      }
    }
  })

  // Tính toán thống kê
  const totalReviews = reviews.length
  const ratingAvg =
    totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach((r) => {
    const s = Math.min(5, Math.max(1, Math.round(r.rating)))
    dist[s] = (dist[s] || 0) + 1
  })

  const filteredReviews = activeFilter
    ? reviews.filter((r) => Math.round(r.rating) === activeFilter)
    : reviews

  const STAR_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc']

  if (isLoading) {
    return (
      <div className='py-10 text-center text-muted-foreground animate-pulse'>
        Đang tải đánh giá...
      </div>
    )
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
      <div className='space-y-4'>
        {filteredReviews.length === 0 ? (
          <div className='text-center py-10 text-slate-400 text-sm'>
            <Star className='h-10 w-10 mx-auto mb-2 text-slate-200' />
            Chưa có đánh giá nào cho bộ lọc này.
          </div>
        ) : (
          filteredReviews.map((rv: ReviewResponse) => (
            <div
              key={rv.id}
              className='flex gap-3 p-4 bg-white rounded-xl border border-border/60 hover:border-border transition-colors'
            >
              {/* Avatar User */}
              <div className='h-10 w-10 shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden border'>
                {rv.avatarUrl ? (
                  <img
                    src={rv.avatarUrl}
                    alt={rv.fullName}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <User className='h-5 w-5 text-blue-600' />
                )}
              </div>

              <div className='flex-1 min-w-0'>
                {/* Header User info */}
                <div className='flex items-center justify-between gap-2 flex-wrap mb-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-sm text-foreground'>{rv.fullName}</span>
                    <span className='text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 font-medium'>
                      <ShieldCheck className='h-3 w-3' /> Đã mua hàng
                    </span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {format(new Date(rv.createdAt), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>

                {/* Stars */}
                <div className='flex items-center gap-1 mb-1'>
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

                {/* Variant Name */}
                {rv.variantName && (
                  <div className='text-xs text-muted-foreground mb-2'>
                    Phân loại hàng: {rv.variantName}
                  </div>
                )}

                {/* Content */}
                <p className='text-sm text-foreground leading-relaxed mb-3'>{rv.comment}</p>

                {/* Media (Images/Videos) - ĐÃ CẬP NHẬT GIAO DIỆN VÀ SỰ KIỆN CLICK */}
                {rv.mediaList && rv.mediaList.length > 0 && (
                  <div className='flex flex-wrap gap-2 mb-3'>
                    {rv.mediaList.map((media) => (
                      <div
                        key={media.id}
                        onClick={() =>
                          setSelectedMedia({ url: media.mediaUrl, type: media.mediaType })
                        }
                        className='h-16 w-16 rounded-md border border-border/60 bg-black overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center relative'
                      >
                        {media.mediaType === 'IMAGE' ? (
                          <img
                            src={media.mediaUrl}
                            alt='Review media'
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          <>
                            {/* Thẻ video không có controls để làm thumbnail mờ */}
                            <video
                              src={media.mediaUrl}
                              className='h-full w-full object-cover opacity-70'
                            />
                            <PlayCircle className='absolute text-white/90 h-6 w-6' />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin Reply */}
                {rv.reply && (
                  <div className='mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 relative'>
                    <div className='absolute -top-1.5 left-4 w-3 h-3 bg-slate-50 border-l border-t border-slate-100 transform rotate-45'></div>
                    <div className='flex items-center gap-1.5 mb-1'>
                      <span className='font-semibold text-xs text-red-600'>
                        Phản hồi từ VTech Store
                      </span>
                      <span className='text-[10px] text-muted-foreground'>
                        - {format(new Date(rv.reply.createdAt), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <p className='text-sm text-slate-700'>{rv.reply.replyText}</p>
                  </div>
                )}

                {/* Nút Hữu ích */}
                <button
                  onClick={() => {
                    if (!localStorage.getItem('access_token')) {
                      toast.error('Vui lòng đăng nhập để thực hiện chức năng này.')
                      // TRUYỀN URL HIỆN TẠI VÀO STATE
                      navigate('/login', { state: { from: location.pathname } })
                      return
                    }
                    voteHelpfulMutation.mutate(rv.id)
                  }}
                  disabled={voteHelpfulMutation.isPending}
                  className='flex items-center gap-1.5 mt-3 text-xs text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50'
                >
                  <ThumbsUp
                    className={`h-3.5 w-3.5 ${rv.helpfulCount > 0 ? 'fill-blue-100 text-blue-600' : ''}`}
                  />
                  Hữu ích {rv.helpfulCount > 0 && `(${rv.helpfulCount})`}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL PHÓNG TO ẢNH / VIDEO */}
      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className='max-w-4xl w-fit p-1 bg-black/95 border-none shadow-none flex items-center justify-center'>
          {selectedMedia?.type === 'IMAGE' ? (
            <img
              src={selectedMedia.url}
              alt='Enlarged review media'
              className='max-h-[85vh] max-w-[90vw] object-contain rounded-md'
            />
          ) : (
            <video
              src={selectedMedia?.url}
              controls
              autoPlay
              className='max-h-[85vh] max-w-[90vw] rounded-md outline-none'
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
