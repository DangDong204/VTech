import { PromotionStatusBadge } from '@/components/admin/data/manage-promotion/PromotionStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PromotionType } from '@/defines/enum/promotion.enum'
import { getVariantByIdApi } from '@/services/product-variant/variant.api'
import type { PromotionResponse } from '@/services/promotion/promotion.type'
import { Banknote, Percent } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface ViewPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion: PromotionResponse
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export function ViewPromotionDialog({ open, onOpenChange, promotion }: ViewPromotionDialogProps) {
  const { t } = useTranslation('promotion')

  // State lưu chi tiết các biến thể đang được áp dụng
  const [variantDetails, setVariantDetails] = useState<
    Record<string, { name: string; sku: string }>
  >({})
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)

  // Fetch thông tin chi tiết biến thể khi Dialog mở
  useEffect(() => {
    let isMounted = true
    const fetchVariantDetails = async () => {
      if (open && promotion.variantIds && promotion.variantIds.length > 0) {
        setIsLoadingVariants(true)
        try {
          const details: Record<string, { name: string; sku: string }> = {}
          const responses = await Promise.all(
            promotion.variantIds.map((id) => getVariantByIdApi(id).catch(() => null))
          )

          responses.forEach((variant) => {
            if (variant) {
              details[variant.id] = {
                name: `${variant.productName} - ${variant.versionName} (${variant.colorName})`,
                sku: variant.sku
              }
            }
          })

          if (isMounted) setVariantDetails(details)
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải danh sách biến thể'

          toast.error(message)
        } finally {
          if (isMounted) setIsLoadingVariants(false)
        }
      } else {
        if (isMounted) setVariantDetails({})
      }
    }

    fetchVariantDetails()

    return () => {
      isMounted = false
    }
  }, [open, promotion.variantIds])

  // Hàm hỗ trợ render giao diện Loại giảm giá (Type)
  const renderType = (type: PromotionType) => {
    const label = t(`filters.type.${type}`)
    let colorClass = 'bg-gray-100 text-gray-800 border-gray-200'
    let Icon = Banknote

    if (type === PromotionType.PERCENTAGE) {
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200'
      Icon = Percent
    } else if (type === PromotionType.FIXED_AMOUNT) {
      colorClass = 'bg-green-100 text-green-800 border-green-200'
      Icon = Banknote
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

  // Hàm hỗ trợ render Mức giảm
  const renderDiscountValue = () => {
    if (promotion.discountType === PromotionType.PERCENTAGE) {
      return (
        <span className='font-bold text-destructive text-base'>{promotion.discountValue}%</span>
      )
    }
    return (
      <span className='font-bold text-destructive text-base'>
        {formatVND(promotion.discountValue)}
      </span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>{t('titles.view')}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-2 max-h-[80vh] overflow-y-auto pr-2'>
          {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
          <div className='space-y-3'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('sections.basicInfo')}
            </h3>
            <div className='grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg'>
              <div className='space-y-1.5 col-span-2 sm:col-span-1'>
                <Label className='text-muted-foreground'>{t('fields.promotionName.label')}</Label>
                <p className='font-bold text-primary text-base'>{promotion.promotionName}</p>
              </div>
              <div className='space-y-1.5 col-span-2 sm:col-span-1'>
                <Label className='text-muted-foreground block'>{t('fields.status.label')}</Label>
                <PromotionStatusBadge status={promotion.status} />
              </div>
              <div className='col-span-2 space-y-1.5'>
                <Label className='text-muted-foreground'>{t('fields.promotionDesc.label')}</Label>
                <p className='font-medium text-sm'>{promotion.promotionDesc || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* KHỐI 2: ĐIỀU KIỆN & THỜI GIAN */}
          <div className='space-y-3'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('sections.conditions')}
            </h3>
            <div className='grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg'>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground block'>{t('fields.type.label')}</Label>
                {renderType(promotion.discountType)}
              </div>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground block'>
                  {t('fields.discountValue.label')}
                </Label>
                {renderDiscountValue()}
              </div>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground'>{t('fields.startDate.label')}</Label>
                <p className='font-medium text-sm'>{promotion.startDate || '-'}</p>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-muted-foreground'>{t('fields.endDate.label')}</Label>
                <p className='font-medium text-sm'>{promotion.endDate || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* KHỐI 3: SẢN PHẨM ÁP DỤNG */}
          <div className='space-y-3'>
            <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              {t('sections.products')}
            </h3>
            <div className='bg-muted/30 p-4 rounded-lg'>
              {!promotion.variantIds || promotion.variantIds.length === 0 ? (
                <p className='text-sm text-muted-foreground italic'>
                  {t('fields.variantIds.empty')}
                </p>
              ) : isLoadingVariants ? (
                <p className='text-sm text-muted-foreground animate-pulse'>
                  Đang tải danh sách sản phẩm...
                </p>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {promotion.variantIds.map((id) => {
                    const detail = variantDetails[id]
                    return (
                      <Badge
                        key={id}
                        variant='secondary'
                        className='text-xs font-medium bg-background border shadow-sm py-1 px-2'
                      >
                        {detail ? detail.name : `Đang tải... (${id})`}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* KHỐI 4: DẤU VẾT THỜI GIAN */}
          <div className='grid grid-cols-2 gap-4 p-2 text-xs'>
            <div className='space-y-1'>
              <Label className='text-muted-foreground text-xs'>{t('fields.createdAt')}</Label>
              <p className='text-muted-foreground'>{promotion.createdAt}</p>
            </div>
            <div className='space-y-1'>
              <Label className='text-muted-foreground text-xs'>{t('fields.updatedAt')}</Label>
              <p className='text-muted-foreground'>{promotion.updatedAt}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
