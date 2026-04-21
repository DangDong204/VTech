import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { VoucherStatusBadge } from '@/components/admin/data/manage-voucher/VoucherStatusBadges'
import { VoucherType } from '@/defines/enum/voucher.enum'
import type { VoucherResponse } from '@/services/voucher/voucher.type'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Banknote, Percent, Truck } from 'lucide-react'

interface ViewVoucherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucher: VoucherResponse
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export function ViewVoucherDialog({ open, onOpenChange, voucher }: ViewVoucherDialogProps) {
  const { t } = useTranslation('voucher')

  const renderType = (type: VoucherType) => {
    const label = t(`filters.type.${type}`)
    let colorClass = 'bg-gray-100 text-gray-800 border-gray-200'
    let Icon = Banknote

    if (type === VoucherType.PERCENTAGE) {
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200'
      Icon = Percent
    } else if (type === VoucherType.FIXED_AMOUNT) {
      colorClass = 'bg-green-100 text-green-800 border-green-200'
      Icon = Banknote
    } else if (type === VoucherType.FREE_SHIP) {
      colorClass = 'bg-purple-100 text-purple-800 border-purple-200'
      Icon = Truck
    }

    return (
      <Badge
        variant='outline'
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${colorClass}`}
      >
        <Icon className='w-3.5 h-3.5' />
        <span>{label}</span>
      </Badge>
    )
  }

  // Hàm hỗ trợ render Mức giảm (Có xử lý hiển thị mức giảm tối đa nếu là %)
  const renderDiscountValue = () => {
    if (voucher.type === VoucherType.PERCENTAGE) {
      return (
        <div className='flex items-center gap-2'>
          <span className='font-bold text-destructive text-base'>{voucher.discountValue}%</span>
          {voucher.maxDiscountAmount && voucher.maxDiscountAmount > 0 && (
            <span className='text-xs text-muted-foreground'>
              (Tối đa {formatVND(voucher.maxDiscountAmount)})
            </span>
          )}
        </div>
      )
    }
    return (
      <span className='font-bold text-destructive text-base'>
        {formatVND(voucher.discountValue)}
      </span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[650px]'>
        <DialogHeader>
          <DialogTitle>{t('titles.view')}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-2'>
          {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
          <div className='space-y-3'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('sections.basicInfo')}
            </h3>
            <div className='grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg'>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground'>{t('fields.voucherCode.label')}</Label>
                <p className='font-bold text-primary uppercase text-base'>{voucher.voucherCode}</p>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground block'>{t('fields.status.label')}</Label>
                <VoucherStatusBadge status={voucher.status} />
              </div>
              <div className='col-span-2 space-y-1.5'>
                <Label className='text-muted-foreground'>{t('fields.voucherName.label')}</Label>
                <p className='font-medium'>{voucher.voucherName}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* KHỐI 2: ĐIỀU KIỆN ÁP DỤNG */}
          <div className='space-y-3'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('sections.conditions')}
            </h3>
            <div className='grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg'>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground block'>{t('fields.type.label')}</Label>
                {renderType(voucher.type)}
              </div>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground block'>
                  {t('fields.discountValue.label')}
                </Label>
                {renderDiscountValue()}
              </div>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground'>{t('fields.minOrderValue.label')}</Label>
                <p className='font-medium'>{formatVND(voucher.minOrderValue)}</p>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground'>{t('fields.usageLimit.label')}</Label>
                <p className='font-medium'>
                  <span className='text-primary'>{voucher.usedCount}</span> /{' '}
                  {voucher.usageLimit ? voucher.usageLimit : '∞'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* KHỐI 3: THỜI GIAN */}
          <div className='space-y-3'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('sections.timeline')}
            </h3>
            <div className='grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg text-sm'>
              <div className='space-y-1'>
                <Label className='text-muted-foreground'>{t('fields.startDate.label')}</Label>
                <p className='font-medium'>{voucher.startDate || '-'}</p>
              </div>
              <div className='space-y-1'>
                <Label className='text-muted-foreground'>{t('fields.endDate.label')}</Label>
                <p className='font-medium'>{voucher.endDate || '-'}</p>
              </div>
              <div className='space-y-1 pt-2'>
                <Label className='text-muted-foreground text-xs'>{t('fields.createdAt')}</Label>
                <p className='text-muted-foreground text-xs'>{voucher.createdAt}</p>
              </div>
              <div className='space-y-1 pt-2'>
                <Label className='text-muted-foreground text-xs'>{t('fields.updatedAt')}</Label>
                <p className='text-muted-foreground text-xs'>{voucher.updatedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
