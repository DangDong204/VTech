import { useState, useRef } from 'react'
import { Star, UploadCloud, X, Loader2, Send, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createReviewApi, uploadReviewMediaApi } from '@/services/review/review.api'

interface CreateReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  orderDetailId: string
  productName: string
  variantName: string
  imageUrl: string
}

const STAR_LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời']

// Khai báo kiểu cho media
interface MediaItem {
  mediaUrl: string
  mediaType: 'IMAGE' | 'VIDEO'
}

export function CreateReviewModal({
  isOpen,
  onClose,
  onSuccess,
  orderDetailId,
  productName,
  variantName,
  imageUrl
}: CreateReviewModalProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  // ĐỔI STATE SANG MẢNG OBJECT
  const [mediaList, setMediaList] = useState<MediaItem[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleClose = () => {
    setRating(0)
    setComment('')
    setMediaList([])
    onClose()
  }

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: () =>
      createReviewApi({
        orderDetailId,
        rating,
        comment,
        mediaList // Truyền thẳng mediaList vì cấu trúc đã khớp với payload
      }),
    onSuccess: () => {
      toast.success('Cảm ơn bạn đã đánh giá sản phẩm!')
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] })
      onSuccess()
      handleClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.')
    }
  })

  // CẬP NHẬT HÀM UPLOAD
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (mediaList.length + files.length > 5) {
      toast.error('Chỉ được tải lên tối đa 5 tệp (ảnh/video)')
      return
    }

    setIsUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        // Sử dụng API mới trả về cả Url và Type
        const mediaData = await uploadReviewMediaApi(files[i])
        setMediaList((prev) => [...prev, mediaData])
      }
      toast.success('Tải tệp lên thành công')
    } catch {
      toast.error('Tải tệp lên thất bại (Video tối đa 30MB, Ảnh tối đa 5MB)')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeMedia = (indexToRemove: number) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = () => {
    if (rating === 0) {
      toast.warning('Vui lòng chọn số sao đánh giá.')
      return
    }
    submitReview()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='sm:max-w-[500px] p-0 overflow-hidden'>
        <DialogHeader className='p-4 pb-0'>
          <DialogTitle className='text-lg font-bold'>Đánh giá sản phẩm</DialogTitle>
        </DialogHeader>

        <div className='p-5 space-y-6'>
          <div className='flex items-center gap-3 bg-slate-50 p-3 rounded-lg border'>
            <div className='h-12 w-12 rounded bg-white border flex items-center justify-center p-1 shrink-0'>
              <img
                src={imageUrl}
                alt={productName}
                className='max-h-full max-w-full object-contain'
              />
            </div>
            <div className='flex-1 min-w-0'>
              <h4 className='font-semibold text-sm truncate'>{productName}</h4>
              <p className='text-xs text-muted-foreground mt-0.5'>Phân loại: {variantName}</p>
            </div>
          </div>

          <div className='flex flex-col items-center justify-center gap-2'>
            <span className='text-sm font-medium text-slate-600'>Chất lượng sản phẩm</span>
            <div className='flex items-center gap-2'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className='focus:outline-none transition-transform hover:scale-110'
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className='h-5 text-sm font-semibold text-amber-600'>
              {STAR_LABELS[hoverRating || rating]}
            </div>
          </div>

          <div className='space-y-3'>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Hãy chia sẻ những điều bạn thích về sản phẩm này nhé...'
              className='min-h-[100px] resize-none focus-visible:ring-amber-400'
            />

            <div className='space-y-2'>
              <div className='flex flex-wrap gap-2'>
                {mediaList.map((media, idx) => (
                  <div
                    key={idx}
                    className='relative h-16 w-16 rounded-md border border-border/60 bg-black overflow-hidden group flex items-center justify-center'
                  >
                    {/* HIỂN THỊ PHÂN BIỆT ẢNH HOẶC VIDEO */}
                    {media.mediaType === 'IMAGE' ? (
                      <img
                        src={media.mediaUrl}
                        alt='Review'
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <>
                        <video
                          src={media.mediaUrl}
                          className='h-full w-full object-cover opacity-80'
                        />
                        <PlayCircle className='absolute text-white/80 h-6 w-6' />
                      </>
                    )}

                    <button
                      type='button'
                      onClick={() => removeMedia(idx)}
                      className='absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))}

                {mediaList.length < 5 && (
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className='h-16 w-16 border-2 border-dashed border-slate-300 rounded-md flex flex-col items-center justify-center text-slate-500 hover:border-amber-400 hover:text-amber-500 transition-colors disabled:opacity-50 bg-slate-50'
                  >
                    {isUploading ? (
                      <Loader2 className='h-5 w-5 animate-spin' />
                    ) : (
                      <UploadCloud className='h-5 w-5' />
                    )}
                    <span className='text-[10px] mt-1'>Thêm ảnh/video</span>
                  </button>
                )}

                {/* MỞ RỘNG ACCEPT CHO VIDEO */}
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*,video/mp4,video/webm,video/quicktime'
                  multiple
                  className='hidden'
                  onChange={handleFileChange}
                />
              </div>
              <p className='text-xs text-muted-foreground'>Thêm tối đa 5 hình ảnh hoặc video.</p>
            </div>
          </div>
        </div>

        <div className='p-4 border-t bg-slate-50 flex justify-end gap-2'>
          <Button variant='outline' onClick={handleClose} disabled={isPending || isUploading}>
            Trở lại
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || isUploading}
            className='bg-amber-500 hover:bg-amber-600 text-white'
          >
            {isPending ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Send className='h-4 w-4 mr-2' />
            )}
            Hoàn thành
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
