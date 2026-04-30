import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { replyToReviewApi, updateReviewStatusApi } from '@/services/review/review.api'
import type { ReviewResponse } from '@/services/review/review.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { format } from 'date-fns'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Maximize2,
  MessageSquareReply,
  PlayCircle,
  Send,
  Star,
  Zap
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const QUICK_REPLIES = [
  {
    label: 'Cảm ơn (Chung)',
    text: 'Chào bạn, VTech rất vui vì bạn đã hài lòng với chất lượng sản phẩm. Cảm ơn bạn đã tin tưởng mua sắm tại shop. Trong quá trình sử dụng, nếu cần hỗ trợ cài đặt hay bảo hành, bạn cứ nhắn tin trực tiếp để đội ngũ kỹ thuật của VTech hỗ trợ nhé.'
  },
  {
    label: 'Cảm ơn (Chi tiết)',
    text: 'Dạ VTech cảm ơn bạn đã dành thời gian đánh giá chi tiết ạ! Đánh giá của bạn là động lực rất lớn để shop tiếp tục nâng cao chất lượng dịch vụ. Bạn nhớ giữ lại hộp và phụ kiện để được hỗ trợ bảo hành tốt nhất nhé.'
  },
  {
    label: 'Xin lỗi (Lỗi SP)',
    text: 'Chào bạn, VTech chân thành xin lỗi vì sự cố kỹ thuật bạn gặp phải với thiết bị này. Bộ phận CSKH đã ghi nhận trường hợp của bạn và sẽ chủ động liên hệ qua số điện thoại đặt hàng để hướng dẫn kiểm tra và hỗ trợ đổi mới theo chính sách bảo hành. Mong bạn thông cảm!'
  },
  {
    label: 'Xin lỗi (Vận chuyển)',
    text: 'Chào bạn, VTech rất tiếc vì trải nghiệm nhận hàng lần này chưa được trọn vẹn. Shop xin ghi nhận góp ý của bạn để làm việc lại với đơn vị vận chuyển. Nếu thiết bị bên trong bị ảnh hưởng, bạn hãy nhắn tin ngay cho shop để VTech xử lý đổi trả ngay nhé!'
  }
]

interface ReviewDetailModalProps {
  isOpen: boolean
  onClose: () => void
  review: ReviewResponse | null
}

export function ReviewDetailModal({ isOpen, onClose, review }: ReviewDetailModalProps) {
  const queryClient = useQueryClient()
  const [confirmAction, setConfirmAction] = useState<'APPROVED' | 'HIDDEN' | null>(null)

  // STATE MỚI ĐỂ QUẢN LÝ VIỆC PHÓNG TO ẢNH/VIDEO
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string
    type: 'IMAGE' | 'VIDEO'
  } | null>(null)

  // 1. Khởi tạo giá trị mặc định cho replyText ngay từ đầu
  const [replyText, setReplyText] = useState(review?.reply?.replyText || '')

  // 2. Tạo một state để lưu trữ ID của review trước đó
  const [prevReviewId, setPrevReviewId] = useState<string | undefined>(review?.id)

  // 3. Nếu prop `review` thay đổi (VD: bạn mở modal của một đánh giá khác),
  // ta cập nhật lại state ngay lập tức mà không cần dùng useEffect
  if (review?.id !== prevReviewId) {
    setPrevReviewId(review?.id)
    setReplyText(review?.reply?.replyText || '')
  }

  const replyMutation = useMutation({
    mutationFn: () => replyToReviewApi(review!.id, { replyText }),
    onSuccess: () => {
      toast.success('Gửi phản hồi thành công!')
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      onClose()
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phản hồi.')
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'APPROVED' | 'HIDDEN') => updateReviewStatusApi(review!.id, status),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công!')
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      setConfirmAction(null)
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.')
      setConfirmAction(null)
    }
  })

  const handleReply = () => {
    if (!replyText.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi')
      return
    }
    replyMutation.mutate()
  }

  const handleConfirmExecute = (e: React.MouseEvent) => {
    e.preventDefault()
    if (confirmAction) {
      updateStatusMutation.mutate(confirmAction)
    }
  }

  if (!review) return null

  const isApproved = review.status === 'APPROVED'
  const isHidden = review.status === 'HIDDEN'
  const isPending = review.status === 'PENDING'

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className='max-w-4xl p-0 overflow-hidden'>
          <DialogHeader className='p-5 border-b pb-4'>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <span>Chi tiết Đánh giá</span>
              {isHidden && (
                <span className='text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border'>
                  Đã bị ẩn
                </span>
              )}
              {isPending && (
                <span className='text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded border'>
                  Đang chờ duyệt
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-1 md:grid-cols-2 min-h-[400px]'>
            <div className='p-5 bg-slate-50 border-r'>
              <h3 className='text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4'>
                Phía Khách hàng
              </h3>

              <div className='flex gap-3 mb-4'>
                <div className='h-12 w-12 rounded-full overflow-hidden bg-white border shrink-0'>
                  <img
                    src={review.avatarUrl ?? 'https://ui.shadcn.com/avatars/02.png'}
                    alt='Avatar'
                    className='h-full w-full object-cover'
                  />
                </div>
                <div>
                  <h4 className='font-bold text-slate-800'>{review.fullName}</h4>
                  <div className='text-xs text-slate-500'>
                    {format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-1 mb-2'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>

              <div className='flex items-start gap-3 mb-4 p-3 bg-white rounded-md border shadow-sm'>
                <div className='h-12 w-12 shrink-0 border rounded overflow-hidden bg-slate-50 flex items-center justify-center'>
                  {review.productImage ? (
                    <img
                      src={review.productImage}
                      alt='Product'
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <span className='text-[10px] text-slate-400 italic'>No ảnh</span>
                  )}
                </div>
                <div className='flex-1 overflow-hidden'>
                  <h5
                    className='text-sm font-bold text-blue-700 truncate'
                    title={review.productName}
                  >
                    {review.productName}
                  </h5>
                  <div className='text-xs font-medium text-slate-600 mt-0.5'>
                    Phân loại: <span className='text-slate-800'>{review.variantName}</span>
                  </div>
                </div>
              </div>

              <p className='text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-md border shadow-sm'>
                {review.comment || (
                  <span className='italic text-slate-400'>Khách không để lại bình luận...</span>
                )}
              </p>

              {/* MEDIA LIST CÓ EVENT CLICK VÀ ICON ZOOM */}
              {review.mediaList && review.mediaList.length > 0 && (
                <div className='flex gap-2 flex-wrap mt-3'>
                  {review.mediaList.map((media) => (
                    <div
                      key={media.id}
                      onClick={() =>
                        setSelectedMedia({ url: media.mediaUrl, type: media.mediaType })
                      }
                      className='group h-16 w-16 bg-black rounded border overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all'
                    >
                      <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 transition-opacity'>
                        <Maximize2 className='h-5 w-5 text-white drop-shadow-md' />
                      </div>

                      {media.mediaType === 'IMAGE' ? (
                        <img
                          src={media.mediaUrl}
                          className='h-full w-full object-cover'
                          alt='media'
                        />
                      ) : (
                        <>
                          <video
                            src={media.mediaUrl}
                            className='h-full w-full object-cover opacity-70'
                          />
                          <PlayCircle className='h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white' />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='p-5 flex flex-col'>
              <h3 className='text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4'>
                Xử lý của Admin
              </h3>

              <div className='flex-1 flex flex-col'>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm font-medium flex items-center gap-2'>
                    <MessageSquareReply className='h-4 w-4 text-blue-600' />
                    Nội dung phản hồi (Sẽ hiển thị công khai)
                  </label>
                </div>

                {!review.reply && (
                  <div className='mb-3 p-2 bg-amber-50 rounded-md border border-amber-100'>
                    <span className='text-[11px] font-semibold text-amber-700 flex items-center gap-1 mb-2'>
                      <Zap className='h-3 w-3' /> CHỌN MẪU TRẢ LỜI NHANH:
                    </span>
                    <div className='flex flex-wrap gap-1.5'>
                      {QUICK_REPLIES.map((item, idx) => (
                        <button
                          key={idx}
                          type='button'
                          onClick={() => setReplyText(item.text)}
                          className='text-[11px] px-2.5 py-1 bg-white hover:bg-amber-400 hover:text-white border border-amber-200 rounded-full transition-all text-slate-600 shadow-sm'
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  readOnly={!!review.reply}
                  className='flex-1 min-h-[120px] resize-none focus-visible:ring-blue-400 bg-slate-50'
                  placeholder='Nhập thủ công hoặc chọn mẫu bên trên...'
                />

                {review.reply && (
                  <p className='text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1'>
                    ✓ Bạn đã phản hồi đánh giá này vào{' '}
                    {format(new Date(review.reply.createdAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                )}
              </div>

              <div className='mt-6 flex items-center justify-between border-t pt-4'>
                <div className='flex items-center gap-2'>
                  {isPending && (
                    <>
                      <Button
                        variant='destructive'
                        size='sm'
                        disabled={updateStatusMutation.isPending}
                        onClick={() => setConfirmAction('HIDDEN')}
                      >
                        <EyeOff className='h-4 w-4 mr-1.5' /> Ẩn từ chối
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={updateStatusMutation.isPending}
                        onClick={() => setConfirmAction('APPROVED')}
                        className='bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                      >
                        <CheckCircle2 className='h-4 w-4 mr-1.5' /> Duyệt hiển thị
                      </Button>
                    </>
                  )}

                  {isApproved && (
                    <Button
                      variant='destructive'
                      size='sm'
                      disabled={updateStatusMutation.isPending}
                      onClick={() => setConfirmAction('HIDDEN')}
                      className='bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
                    >
                      <EyeOff className='h-4 w-4 mr-1.5' /> Ẩn vi phạm
                    </Button>
                  )}

                  {isHidden && (
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={updateStatusMutation.isPending}
                      onClick={() => setConfirmAction('APPROVED')}
                      className='bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                    >
                      <Eye className='h-4 w-4 mr-1.5' /> Khôi phục hiển thị
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleReply}
                  disabled={!!review.reply || replyMutation.isPending}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  {replyMutation.isPending ? (
                    <Loader2 className='h-4 w-4 mr-1.5 animate-spin' />
                  ) : (
                    <Send className='h-4 w-4 mr-1.5' />
                  )}
                  Gửi phản hồi
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG XEM ẢNH/VIDEO FULL MÀN HÌNH */}
      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        {/* z-[100] để đè lên modal chi tiết review ở dưới */}
        <DialogContent className='max-w-4xl w-fit p-1 bg-black/95 border-none shadow-none flex items-center justify-center z-[100]'>
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

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(isOpen) => !isOpen && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'APPROVED'
                ? 'Xác nhận duyệt/hiển thị đánh giá?'
                : 'Xác nhận ẩn đánh giá?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'APPROVED'
                ? 'Đánh giá này sẽ được hiển thị công khai trên trang sản phẩm. Bạn có chắc chắn không?'
                : 'Bạn có chắc chắn muốn ẩn/từ chối đánh giá này không? Nội dung này sẽ không được hiển thị với người mua hàng.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatusMutation.isPending}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExecute}
              disabled={updateStatusMutation.isPending}
              className={
                confirmAction === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              {confirmAction === 'APPROVED' ? 'Xác nhận duyệt' : 'Xác nhận ẩn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
