import { cn } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, CheckCircle2, ChevronRight, Loader2, Package } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateOrderStatusApi } from '@/services/order/order.api'
import { type OrderResponse, type OrderStatus } from '@/services/order/order.type'
import { Clock, RotateCcw, Truck, XCircle } from 'lucide-react'

interface Props {
  order: OrderResponse | null
  isOpen: boolean
  onClose: () => void
}

const STATUS_COLOR: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  SHIPPING: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  DELIVERED: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
  RETURNED: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
}

const STATUS_ICON: Record<OrderStatus, React.ReactNode> = {
  PENDING: <Clock className='w-4 h-4' />,
  CONFIRMED: <CheckCircle className='w-4 h-4' />,
  PROCESSING: <Package className='w-4 h-4' />,
  SHIPPING: <Truck className='w-4 h-4' />,
  DELIVERED: <CheckCircle2 className='w-4 h-4' />,
  CANCELLED: <XCircle className='w-4 h-4' />,
  RETURNED: <RotateCcw className='w-4 h-4' />
}

// Thêm props textConfirmed và textDrag để nhận text i18n từ component cha
function SlideToConfirm({
  onConfirmed,
  disabled,
  textConfirmed,
  textDrag
}: {
  onConfirmed: () => void
  disabled: boolean
  textConfirmed: string
  textDrag: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pos, setPos] = useState(0) // 0..1
  const [confirmed, setConfirmed] = useState(false)
  const startXRef = useRef(0)
  const currentPxRef = useRef(0)

  const getMax = () => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return 1
    return track.offsetWidth - thumb.offsetWidth - 8
  }

  const clamp = (px: number) => Math.max(0, Math.min(px, getMax()))

  const snap = useCallback(() => {
    setPos(1)
    setConfirmed(true)
    onConfirmed()
  }, [onConfirmed])

  const handlePointerDown = (clientX: number) => {
    if (disabled || confirmed) return
    setIsDragging(true)
    startXRef.current = clientX - currentPxRef.current
  }

  const handlePointerMove = (clientX: number) => {
    if (!isDragging) return
    const px = clamp(clientX - startXRef.current)
    currentPxRef.current = px
    const p = px / getMax()
    setPos(p)
    if (p >= 0.95) snap()
  }

  const handlePointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (!confirmed) {
      setPos(0)
      currentPxRef.current = 0
    }
  }

  const thumbLeft = confirmed ? `calc(100% - 44px)` : `${pos * (100 - 0)}%`
  const fillWidth = confirmed ? '100%' : `calc(${pos * 100}% + 44px)`

  return (
    <div
      ref={trackRef}
      className='relative h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden select-none'
      onMouseMove={(e) => handlePointerMove(e.clientX)}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
      onTouchEnd={handlePointerUp}
    >
      {/* Fill bar */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 rounded-full transition-colors duration-200',
          confirmed ? 'bg-green-200' : pos > 0.5 ? 'bg-green-100' : 'bg-blue-100'
        )}
        style={{ width: fillWidth, transition: isDragging ? 'none' : 'width .15s' }}
      />

      {/* Track label */}
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
        <span
          className={cn(
            'text-sm font-medium transition-opacity duration-150',
            confirmed ? 'text-green-700 opacity-100' : pos > 0.3 ? 'opacity-0' : 'text-slate-400'
          )}
        >
          {confirmed ? textConfirmed : textDrag}
        </span>
      </div>

      {/* Thumb */}
      <div
        ref={thumbRef}
        className={cn(
          'absolute top-1 bottom-1 w-10 rounded-full border flex items-center justify-center z-10',
          'transition-colors duration-200',
          confirmed
            ? 'bg-green-500 border-green-600 cursor-default'
            : disabled
              ? 'bg-slate-200 border-slate-300 cursor-not-allowed'
              : 'bg-white border-slate-300 cursor-grab active:cursor-grabbing shadow-sm'
        )}
        style={{
          left: thumbLeft,
          transition: isDragging ? 'none' : 'left .15s'
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          handlePointerDown(e.clientX)
        }}
        onTouchStart={(e) => {
          e.preventDefault()
          handlePointerDown(e.touches[0].clientX)
        }}
      >
        {confirmed ? (
          <CheckCircle2 className='w-5 h-5 text-white' />
        ) : (
          <ChevronRight className={cn('w-5 h-5', disabled ? 'text-slate-300' : 'text-slate-500')} />
        )}
      </div>
    </div>
  )
}

export function UpdateOrderStatusDialog({ order, isOpen, onClose }: Props) {
  const { t } = useTranslation('order')
  const queryClient = useQueryClient()

  const [note, setNote] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)

  const getNextAvailableStates = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'PENDING':
        return ['CONFIRMED']
      case 'CONFIRMED':
        return ['PROCESSING']
      case 'PROCESSING':
        return ['SHIPPING']
      default:
        return []
    }
  }

  const availableStates = order ? getNextAvailableStates(order.orderStatus) : []
  const nextStatus = availableStates[0] ?? null // Only ever 1 next state

  const mutation = useMutation({
    mutationFn: () =>
      updateOrderStatusApi(order!.id, { newStatus: nextStatus as OrderStatus, note }),
    onSuccess: () => {
      toast.success(t('message.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      handleClose()
    },
    onError: () => {
      toast.error(t('message.updateError'))
    }
  })

  const handleClose = () => {
    setNote('')
    setIsConfirmed(false)
    onClose()
  }

  const currentColor = order ? STATUS_COLOR[order.orderStatus] : STATUS_COLOR.PENDING
  const nextColor = nextStatus ? STATUS_COLOR[nextStatus] : null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {t('actions.updateStatus')} — <span className='text-slate-500'>{order?.orderCode}</span>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-5 py-2'>
          {/* Status transition visualizer */}
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'flex-1 rounded-lg border px-4 py-3 text-center',
                currentColor.bg,
                currentColor.border
              )}
            >
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-wide mb-0.5 opacity-60',
                  currentColor.text
                )}
              >
                {t('updateDialog.current')}
              </p>
              <p
                className={cn(
                  'text-sm font-semibold flex items-center justify-center gap-1.5',
                  currentColor.text
                )}
              >
                {order && STATUS_ICON[order.orderStatus]}
                {order && t(`status.${order.orderStatus}`)}
              </p>
            </div>

            <ChevronRight className='w-5 h-5 text-slate-400 shrink-0' />

            <div
              className={cn(
                'flex-1 rounded-lg border px-4 py-3 text-center transition-opacity',
                nextColor ? `${nextColor.bg} ${nextColor.border}` : 'bg-slate-50 border-slate-200',
                !nextStatus && 'opacity-40'
              )}
            >
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-wide mb-0.5 opacity-60',
                  nextColor ? nextColor.text : 'text-slate-500'
                )}
              >
                {t('updateDialog.next')}
              </p>
              <p
                className={cn(
                  'text-sm font-semibold flex items-center justify-center gap-1.5',
                  nextColor ? nextColor.text : 'text-slate-500'
                )}
              >
                {nextStatus && STATUS_ICON[nextStatus]}
                {nextStatus ? t(`status.${nextStatus}`) : t('updateDialog.none')}
              </p>
            </div>
          </div>

          {nextStatus ? (
            <>
              {/* Slide to confirm */}
              <div className='space-y-2'>
                <Label className='text-sm text-slate-600'>
                  {t('updateDialog.confirmTransition')}
                </Label>
                <SlideToConfirm
                  onConfirmed={() => setIsConfirmed(true)}
                  disabled={mutation.isPending}
                  textConfirmed={t('updateDialog.slider.confirmed')}
                  textDrag={t('updateDialog.slider.dragToConfirm')}
                />
              </div>

              {/* Note */}
              <div className='space-y-2'>
                <Label className='text-sm text-slate-600'>
                  {t('updateDialog.note')}{' '}
                  <span className='text-slate-400 font-normal'>{t('updateDialog.optional')}</span>
                </Label>
                <Textarea
                  placeholder={t('updateDialog.notePlaceholder')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          ) : (
            <p className='text-sm text-slate-500 text-center py-2'>
              {t('updateDialog.cannotUpdate')}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={mutation.isPending}>
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !isConfirmed || !nextStatus}
          >
            {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
