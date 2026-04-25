import { useState } from 'react'
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
import { Layers, ImagePlus, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface EditVariantFormProps {
  variant: ProductVariantResponse
  onSuccess: () => void
}

export function EditVariantForm({ variant, onSuccess }: EditVariantFormProps) {
  const { t } = useTranslation('variant')

  const { data: colors = [] } = useFetchData('colors', getAllColorApi)
  const { data: versions = [] } = useFetchData('versions', getAllVersionApi)

  const [imagePreview, setImagePreview] = useState<string | null>(variant.imageUrl || null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
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
      status: variant.status
    }
  })

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue('image', file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setValue('image', undefined)
    setImagePreview(null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
      <div className='flex flex-col-reverse md:flex-row gap-8'>
        <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4'>
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

          <div className='space-y-2 sm:col-span-2'>
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
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className='w-full md:w-[240px] shrink-0 flex flex-col gap-3'>
          <Label className='font-semibold'>{t('fields.image.label')}</Label>
          <div className='relative w-full aspect-square border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden hover:bg-slate-100 transition-colors group cursor-pointer'>
            {imagePreview ? (
              <>
                <img src={imagePreview} alt='Preview' className='w-full h-full object-contain' />
                <button
                  type='button'
                  onClick={handleRemoveImage}
                  className='absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-destructive hover:bg-white transition-colors'
                  title={t('actions.removeImage')}
                >
                  <X className='w-4 h-4' />
                </button>
              </>
            ) : (
              <label
                htmlFor='editVariantImage'
                className='flex flex-col items-center gap-2 cursor-pointer text-muted-foreground w-full h-full justify-center'
              >
                <ImagePlus className='w-8 h-8' />
                <span className='text-xs'>{t('fields.image.placeholder')}</span>
              </label>
            )}
            <input
              id='editVariantImage'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleImageChange}
            />
          </div>
          {errors.image && (
            <p className='text-sm text-destructive text-center'>{errors.image.message as string}</p>
          )}
        </div>
      </div>

      <div className='flex justify-end gap-2 pt-4 border-t mt-4'>
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
