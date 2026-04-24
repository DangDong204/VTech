import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/pages/admin/manage-product/columns'
import { useTranslation } from 'react-i18next'
import { ProductStatusBadge } from '@/components/admin/data/manage-product/ProductStatusBadges'
import { IMGAE_NOT_FOUND } from '@/defines/upload-image'

interface ViewProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
}

const DetailItem = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className='flex flex-col gap-1'>
    <span className='text-xs font-medium text-muted-foreground'>{label}</span>
    <span className='text-sm font-medium'>{value || '-'}</span>
  </div>
)

export function ViewProductDialog({ open, onOpenChange, product }: ViewProductDialogProps) {
  const { t } = useTranslation('product')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px] p-0'>
        <DialogHeader className='px-6 pt-6 pb-2'>
          <DialogTitle className='flex items-center gap-3'>
            {t('titles.view')}
            <ProductStatusBadge status={product.status} />
          </DialogTitle>
        </DialogHeader>

        <div className='max-h-[80vh] overflow-y-auto px-6 pb-6 space-y-6'>
          {/* 1. THÔNG TIN CƠ BẢN */}
          <div className='space-y-3'>
            <h4 className='font-semibold text-primary'>{t('sections.basicInfo')}</h4>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border'>
              <DetailItem label={t('fields.productName.label')} value={product.productName} />
              <DetailItem label={t('fields.slug.label')} value={product.slug} />
              <DetailItem label={t('fields.categoryId.label')} value={product.categoryName} />
              <DetailItem label={t('fields.brandId.label')} value={product.brandName} />
              <DetailItem
                label={t('fields.warrantyMonths.label')}
                value={`${product.warrantyMonths || 0} tháng`}
              />
              <DetailItem label={t('table.columns.purchases')} value={product.totalPurchases} />
              <DetailItem label='Lượt xem' value={product.totalViews} />
              <DetailItem
                label='Đánh giá'
                value={`${product.ratingAvg} ⭐️ (${product.totalReviews})`}
              />
            </div>

            {/* Mô tả sản phẩm */}
            <div className='flex flex-col gap-1 mt-2'>
              <span className='text-xs font-medium text-muted-foreground'>
                {t('fields.productDesc.label')}
              </span>
              <p className='text-sm p-3 bg-muted/20 border rounded-md min-h-[60px] whitespace-pre-wrap'>
                {product.productDesc || (
                  <span className='text-muted-foreground italic'>Không có mô tả</span>
                )}
              </p>
            </div>

            {/* Danh sách Tags */}
            <div className='flex flex-col gap-2 mt-2'>
              <span className='text-xs font-medium text-muted-foreground'>
                {t('fields.tagIds.label')}
              </span>
              <div className='flex flex-wrap gap-2'>
                {product.tags && product.tags.length > 0 ? (
                  product.tags.map((tag, idx) => (
                    <Badge key={idx} variant='secondary'>
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className='text-sm text-muted-foreground italic'>-</span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* 2. HÌNH ẢNH */}
          <div className='space-y-3'>
            <h4 className='font-semibold text-primary'>{t('sections.images')}</h4>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              {/* Thumbnail */}
              <div className='col-span-1 flex flex-col gap-1'>
                <span className='text-xs font-medium text-muted-foreground'>
                  {t('fields.thumbnail.label')}
                </span>
                <div className='aspect-square rounded-md border overflow-hidden bg-muted flex items-center justify-center'>
                  <img
                    src={product.images?.thumbnail ?? IMGAE_NOT_FOUND}
                    alt='Thumbnail'
                    className='w-full h-full object-cover'
                  />
                </div>
              </div>

              {/* Images Array */}
              <div className='col-span-3 flex flex-col gap-1'>
                <span className='text-xs font-medium text-muted-foreground'>
                  {t('fields.images.label')}
                </span>
                <div className='grid grid-cols-3 gap-3'>
                  {product.images?.images && product.images.images.length > 0 ? (
                    product.images.images.map((img, idx) => (
                      <div
                        key={idx}
                        className='aspect-square rounded-md border overflow-hidden bg-muted'
                      >
                        <img
                          src={img}
                          alt={`Detail ${idx}`}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    ))
                  ) : (
                    <div className='col-span-3 p-4 border border-dashed rounded-md flex items-center justify-center text-sm text-muted-foreground italic'>
                      Không có ảnh chi tiết
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. THÔNG SỐ KỸ THUẬT (Render mảng Array) */}
          {product.specification?.attributes && product.specification.attributes.length > 0 && (
            <>
              <Separator />
              <div className='space-y-3'>
                <h4 className='font-semibold text-primary'>{t('sections.specification')}</h4>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border'>
                  {product.specification.attributes.map((spec, index) => (
                    <DetailItem key={index} label={spec.label} value={spec.value} />
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* 4. THÔNG TIN HỆ THỐNG */}
          <div className='flex items-center justify-between text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border'>
            <span>
              {t('fields.createdAt')}: {product.createdAt}
            </span>
            <span>
              {t('fields.updatedAt')}: {product.updatedAt}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
