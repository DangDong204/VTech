import {
  variantSchema,
  type VariantFormValues
} from '@/components/admin/data/manage-variant/schema/variant.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ProductStatus } from '@/defines/enum/product.enum'
import { useAppMutation } from '@/hooks/useAppMutation'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllColorApi } from '@/services/color/color.api'
import { updateVariantApi } from '@/services/product-variant/variant.api'
import type { ProductVariantResponse } from '@/services/product-variant/variant.type'
import { getAllVersionApi } from '@/services/version/version.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Layers } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface EditVariantFormProps {
  variant: ProductVariantResponse
  onSuccess: () => void
}

export function EditVariantForm({ variant, onSuccess }: EditVariantFormProps) {
  const { t } = useTranslation('variant')

  // Vẫn fetch data để lấy được Label hiển thị trong Select (Dù bị disabled)
  const { data: colors = [] } = useFetchData('colors', getAllColorApi)
  const { data: versions = [] } = useFetchData('versions', getAllVersionApi)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      colorId: variant.colorId,
      versionId: variant.versionId,
      sku: variant.sku,
      basePrice: variant.basePrice,
      salePrice: variant.salePrice ?? undefined,
      stockQuantity: variant.stockQuantity,
      status: variant.status // Giá trị mặc định của status lấy từ variant hiện tại
    }
  })

  // Gọi api update Variant và refetch list variant dựa vào keys ['variants', variant.productId]
  const mutation = useAppMutation(
    (data: VariantFormValues) =>
      updateVariantApi(variant.id, { ...data, productId: variant.productId }),
    ['variants', variant.productId],
    t('message.success.update'),
    t('message.error.update'),
    onSuccess
  )

  const onSubmit = (data: VariantFormValues) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Thuộc tính (Khóa không cho sửa) */}
        <div className='space-y-2'>
          <Label>{t('fields.colorId.label')}</Label>
          <Controller
            control={control}
            name='colorId'
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled>
                <SelectTrigger>
                  <SelectValue placeholder={t('fields.colorId.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className='flex items-center gap-2'>
                        <div
                          className='h-3 w-3 rounded-full border'
                          style={{ backgroundColor: color.hexCode || '#fff' }}
                        ></div>
                        {color.colorName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.versionId.label')}</Label>
          <Controller
            control={control}
            name='versionId'
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled>
                <SelectTrigger>
                  <SelectValue placeholder={t('fields.versionId.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.versionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* SKU */}
        <div className='space-y-2 md:col-span-2'>
          <Label>
            {t('fields.sku.label')} <span className='text-destructive'>*</span>
          </Label>
          <Input
            placeholder={t('fields.sku.placeholder')}
            {...register('sku')}
            className={errors.sku ? 'border-destructive uppercase' : 'uppercase'}
          />
          {errors.sku && <p className='text-sm text-destructive'>{errors.sku.message}</p>}
        </div>

        {/* PRICE */}
        <div className='space-y-2'>
          <Label>
            {t('fields.basePrice.label')} <span className='text-destructive'>*</span>
          </Label>
          <Input
            type='number'
            min={0}
            {...register('basePrice', {
              setValueAs: (v) => (v === '' ? undefined : Number(v))
            })}
            className={errors.basePrice ? 'border-destructive' : ''}
          />
          {errors.basePrice && (
            <p className='text-sm text-destructive'>{errors.basePrice.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.salePrice.label')}</Label>
          <Input
            type='number'
            min={0}
            {...register('salePrice', {
              setValueAs: (v) => (v === '' ? undefined : Number(v))
            })}
            className={errors.salePrice ? 'border-destructive' : ''}
          />
          {errors.salePrice && (
            <p className='text-sm text-destructive'>{errors.salePrice.message}</p>
          )}
        </div>

        {/* TỒN KHO & TRẠNG THÁI */}
        <div className='space-y-2'>
          <Label>{t('fields.stockQuantity.label')}</Label>
          <Input
            type='number'
            min={0}
            {...register('stockQuantity', {
              setValueAs: (v) => (v === '' ? undefined : Number(v))
            })}
            className={errors.stockQuantity ? 'border-destructive' : ''}
          />
          {errors.stockQuantity && (
            <p className='text-sm text-destructive'>{errors.stockQuantity.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.status.label')}</Label>
          <Controller
            control={control}
            name='status'
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {/* Có thể thay bằng t(`fields.status.options.${status}`) nếu i18n của bạn đã có */}
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className='flex justify-end gap-2 pt-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>
          {t('actions.cancel')}
        </Button>
        <Button type='submit' disabled={mutation.isPending}>
          <Layers className='mr-2 h-4 w-4' />
          {t('actions.edit')}
        </Button>
      </div>
    </form>
  )
}
