import {
  createPromotionSchema,
  type CreatePromotionFormValues
} from '@/components/admin/data/manage-promotion/schema/promotion.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PromotionStatus, PromotionType } from '@/defines/enum/promotion.enum'
import { IMGAE_NOT_FOUND } from '@/defines/upload-image'
import { useAppMutation } from '@/hooks/useAppMutation'
import { useFetchData } from '@/hooks/useFetchData'

import { getVariantsByProductIdApi } from '@/services/product-variant/variant.api'
import type { ProductVariantResponse } from '@/services/product-variant/variant.type'
import { getAllProductsApi } from '@/services/product/product.api'
import { createPromotionApi } from '@/services/promotion/promotion.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Megaphone, Search, X } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface CreatePromotionFormProps {
  onSuccess: () => void
}

export function CreatePromotionForm({ onSuccess }: CreatePromotionFormProps) {
  const { t } = useTranslation('promotion')

  const { data: products = [] } = useFetchData('products', getAllProductsApi)

  // States tìm kiếm và chọn sản phẩm
  const [searchProduct, setSearchProduct] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [currentVariants, setCurrentVariants] = useState<ProductVariantResponse[]>([])
  const [selectedVariantDetails, setSelectedVariantDetails] = useState<
    Record<string, { name: string; sku: string }>
  >({})

  // Lọc sản phẩm theo tên
  const filteredProducts = useMemo(() => {
    if (!searchProduct.trim()) return products
    return products.filter((p) => p.productName.toLowerCase().includes(searchProduct.toLowerCase()))
  }, [products, searchProduct])

  // Lấy biến thể khi chọn sản phẩm
  useEffect(() => {
    let isMounted = true
    const fetchVariants = async () => {
      if (selectedProductId) {
        try {
          const res = await getVariantsByProductIdApi(selectedProductId)
          if (isMounted) setCurrentVariants(res)
        } catch {
          if (isMounted) setCurrentVariants([])
        }
      } else {
        Promise.resolve().then(() => {
          if (isMounted) setCurrentVariants([])
        })
      }
    }
    fetchVariants()
    return () => {
      isMounted = false
    }
  }, [selectedProductId])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<CreatePromotionFormValues>({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: {
      promotionName: '',
      promotionDesc: '',
      discountType: PromotionType.PERCENTAGE,
      status: PromotionStatus.ACTIVE,
      discountValue: 0,
      startDate: '',
      endDate: '',
      variantIds: []
    }
  })

  const mutation = useAppMutation(
    createPromotionApi,
    'promotions',
    t('message.success.create'),
    t('message.error.create'),
    onSuccess
  )

  const onSubmit = async (data: CreatePromotionFormValues) => {
    mutation.mutate({
      ...data,
      variantIds: data.variantIds?.length ? data.variantIds : null
    })
  }

  return (
    <Card className='border-none shadow-none px-2 sm:px-5'>
      <CardHeader className='px-0 pt-0 pb-4 border-b mb-6'>
        <div className='flex items-center gap-2'>
          <Megaphone className='h-5 w-5 text-primary' />
          <CardTitle>{t('titles.create')}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className='px-0 pt-0'>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* BỐ CỤC 2 CỘT */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            {/* ---------------- CỘT TRÁI (THÔNG TIN & ĐIỀU KIỆN) - 5 CỘT ---------------- */}
            <div className='lg:col-span-5 space-y-6'>
              <div className='space-y-4'>
                <h3 className='text-base font-semibold text-primary/80 uppercase tracking-wider'>
                  {t('sections.basicInfo')}
                </h3>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label>
                      {t('fields.promotionName.label')} <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      placeholder={t('fields.promotionName.placeholder')}
                      {...register('promotionName')}
                      className={errors.promotionName ? 'border-destructive' : ''}
                    />
                    {errors.promotionName && (
                      <p className='text-sm text-destructive'>{errors.promotionName.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>{t('fields.promotionDesc.label')}</Label>
                    <Input
                      placeholder={t('fields.promotionDesc.placeholder')}
                      {...register('promotionDesc')}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>{t('fields.status.label')}</Label>
                    <Controller
                      control={control}
                      name='status'
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('fields.status.placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PromotionStatus.ACTIVE}>
                              {t('fields.status.options.ACTIVE')}
                            </SelectItem>
                            <SelectItem value={PromotionStatus.INACTIVE}>
                              {t('fields.status.options.INACTIVE')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-4 pt-2 border-t'>
                <h3 className='text-base font-semibold text-primary/80 uppercase tracking-wider'>
                  {t('sections.conditions')}
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>{t('fields.type.label')}</Label>
                    <Controller
                      control={control}
                      name='discountType'
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('fields.type.placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(PromotionType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {t(`fields.type.options.${type}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>
                      {t('fields.discountValue.label')} <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      type='number'
                      min={0}
                      step={1}
                      placeholder={t('fields.discountValue.placeholder')}
                      {...register('discountValue', { valueAsNumber: true })}
                      className={errors.discountValue ? 'border-destructive' : ''}
                    />
                    {errors.discountValue && (
                      <p className='text-sm text-destructive'>{errors.discountValue.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>
                      {t('fields.startDate.label')} <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      type='datetime-local'
                      {...register('startDate')}
                      className={errors.startDate ? 'border-destructive' : ''}
                    />
                    {errors.startDate && (
                      <p className='text-sm text-destructive'>{errors.startDate.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>
                      {t('fields.endDate.label')} <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      type='datetime-local'
                      {...register('endDate')}
                      className={errors.endDate ? 'border-destructive' : ''}
                    />
                    {errors.endDate && (
                      <p className='text-sm text-destructive'>{errors.endDate.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------- CỘT PHẢI (GÁN SẢN PHẨM & BIẾN THỂ) - 7 CỘT ---------------- */}
            <div className='lg:col-span-7 space-y-4 lg:border-l lg:pl-8'>
              <h3 className='text-base font-semibold text-primary/80 uppercase tracking-wider'>
                {t('sections.products')}
              </h3>

              <div className='space-y-4'>
                {/* 1. Khu vực tìm và chọn Sản phẩm */}
                <div className='space-y-2'>
                  <Label>1. Tìm và chọn Sản phẩm gốc</Label>
                  <div className='relative'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Nhập tên sản phẩm để tìm kiếm...'
                      className='pl-9'
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                    />
                  </div>

                  {/* Danh sách Product */}
                  <div className='h-[180px] w-full border rounded-md p-2 overflow-y-auto bg-muted/5 space-y-1 mt-2'>
                    {filteredProducts.length === 0 ? (
                      <p className='text-sm text-muted-foreground text-center mt-10'>
                        Không tìm thấy sản phẩm nào
                      </p>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = selectedProductId === p.id
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedProductId(p.id)}
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors border border-transparent ${
                              isSelected ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'
                            }`}
                          >
                            <img
                              src={p.images?.thumbnail ?? IMGAE_NOT_FOUND}
                              alt={p.productName}
                              className='h-10 w-10 object-cover rounded border bg-white'
                            />
                            <span
                              className={`text-sm ${isSelected ? 'font-semibold text-primary' : 'font-medium'}`}
                            >
                              {p.productName}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* 2. Khu vực chọn Biến thể */}
                <Controller
                  name='variantIds'
                  control={control}
                  render={({ field }) => {
                    const selectedIds = field.value || []

                    return (
                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <Label>2. Chọn các biến thể áp dụng khuyến mãi</Label>
                          <div className='h-[200px] w-full border rounded-md p-4 overflow-y-auto bg-muted/10'>
                            {!selectedProductId ? (
                              <p className='text-sm text-muted-foreground text-center mt-16'>
                                Vui lòng chọn sản phẩm ở trên để xem biến thể
                              </p>
                            ) : currentVariants.length === 0 ? (
                              <p className='text-sm text-muted-foreground text-center mt-16'>
                                Sản phẩm này chưa có cấu hình biến thể nào
                              </p>
                            ) : (
                              <div className='flex flex-col gap-4'>
                                {currentVariants.map((variant) => {
                                  const isChecked = selectedIds.includes(variant.id)
                                  return (
                                    <div
                                      key={variant.id}
                                      className='flex items-start space-x-3 bg-background p-3 rounded-lg border shadow-sm'
                                    >
                                      <Checkbox
                                        id={`variant-${variant.id}`}
                                        checked={isChecked}
                                        className='mt-1'
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([...selectedIds, variant.id])
                                            setSelectedVariantDetails((prev) => ({
                                              ...prev,
                                              [variant.id]: {
                                                name: `${variant.productName} - ${variant.versionName} (${variant.colorName})`,
                                                sku: variant.sku
                                              }
                                            }))
                                          } else {
                                            field.onChange(
                                              selectedIds.filter((id) => id !== variant.id)
                                            )
                                          }
                                        }}
                                      />
                                      <label
                                        htmlFor={`variant-${variant.id}`}
                                        className='text-sm leading-none cursor-pointer flex flex-col gap-1.5 w-full'
                                      >
                                        <span className='font-medium text-base'>
                                          {variant.versionName} - {variant.colorName}
                                        </span>
                                        <div className='flex items-center justify-between text-xs text-muted-foreground'>
                                          <span>SKU: {variant.sku}</span>
                                          <span className='font-medium text-foreground'>
                                            Kho: {variant.stockQuantity}
                                          </span>
                                        </div>
                                      </label>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                          {errors.variantIds && (
                            <p className='text-sm text-destructive'>{errors.variantIds.message}</p>
                          )}
                        </div>

                        {/* 3. Hiển thị các Badge sản phẩm ĐÃ CHỌN */}
                        {selectedIds.length > 0 && (
                          <div className='p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-900/40'>
                            <Label className='text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 block'>
                              Đã chọn ({selectedIds.length} biến thể)
                            </Label>
                            <div className='flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2'>
                              {selectedIds.map((id) => {
                                const detail = selectedVariantDetails[id]
                                return (
                                  <Badge
                                    key={id}
                                    variant='secondary'
                                    className='text-xs font-medium bg-background border shadow-sm py-1'
                                  >
                                    {detail ? detail.name : id}
                                    <X
                                      className='w-3.5 h-3.5 ml-2 cursor-pointer hover:text-destructive transition-colors'
                                      onClick={() => {
                                        field.onChange(selectedIds.filter((vid) => vid !== id))
                                      }}
                                    />
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-6 border-t mt-8'>
            <Button type='submit' disabled={mutation.isPending} className='w-full sm:w-auto px-8'>
              <Megaphone className='mr-2 h-4 w-4' />
              {t('actions.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
