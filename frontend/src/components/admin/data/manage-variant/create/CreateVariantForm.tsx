import {
  variantSchema,
  type VariantFormValues
} from '@/components/admin/data/manage-variant/schema/variant.schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ProductStatus } from '@/defines/enum/product.enum'
import { useAppMutation } from '@/hooks/useAppMutation'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllColorApi } from '@/services/color/color.api'
import { createVariantApi } from '@/services/product-variant/variant.api'
import { getAllVersionApi } from '@/services/version/version.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, Layers, Shuffle, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface CreateVariantFormProps {
  productId: string
  onSuccess: () => void
}

export function CreateVariantForm({ productId, onSuccess }: CreateVariantFormProps) {
  const { t } = useTranslation('variant')

  const { data: colors = [] } = useFetchData('colors', getAllColorApi)
  const { data: versions = [] } = useFetchData('versions', getAllVersionApi)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      colorId: '',
      versionId: '',
      sku: '',
      basePrice: 0,
      salePrice: undefined,
      stockQuantity: 0,
      status: ProductStatus.ACTIVE
    }
  })

  const mutation = useAppMutation(
    (data: VariantFormValues) => createVariantApi({ ...data, productId }),
    ['variants', productId],
    t('message.success.create'),
    t('message.error.create'),
    onSuccess
  )

  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  const generateSKU = () => {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    setValue('sku', `VT-${randomStr}`, { shouldValidate: true })
  }

  return (
    <Card className='border-none shadow-none px-5'>
      <CardHeader className='px-0 pt-0'>
        <div className='flex items-center gap-2'>
          <Layers className='h-5 w-5 text-primary' />
          <CardTitle>{t('titles.create')}</CardTitle>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className='px-0 pt-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='flex flex-col-reverse md:flex-row gap-8'>
            <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label>
                  {t('fields.colorId.label')} <span className='text-destructive'>*</span>
                </Label>
                <Controller
                  control={control}
                  name='colorId'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.colorId ? 'border-destructive' : ''}>
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
                {errors.colorId && (
                  <p className='text-sm text-destructive'>{errors.colorId.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>
                  {t('fields.versionId.label')} <span className='text-destructive'>*</span>
                </Label>
                <Controller
                  control={control}
                  name='versionId'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.versionId ? 'border-destructive' : ''}>
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
                {errors.versionId && (
                  <p className='text-sm text-destructive'>{errors.versionId.message}</p>
                )}
              </div>

              <div className='space-y-2 sm:col-span-2'>
                <Label>
                  {t('fields.sku.label')} <span className='text-destructive'>*</span>
                </Label>
                <div className='flex gap-2'>
                  <Input
                    placeholder={t('fields.sku.placeholder')}
                    {...register('sku')}
                    className={errors.sku ? 'border-destructive uppercase' : 'uppercase'}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    onClick={generateSKU}
                    title='Tạo SKU ngẫu nhiên'
                  >
                    <Shuffle className='h-4 w-4' />
                  </Button>
                </div>
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
                />
                {errors.salePrice && (
                  <p className='text-sm text-destructive'>{errors.salePrice.message}</p>
                )}
              </div>

              <div className='space-y-2 sm:col-span-2'>
                <Label>{t('fields.stockQuantity.label')}</Label>
                <Input
                  type='number'
                  min={0}
                  {...register('stockQuantity', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v))
                  })}
                />
                {errors.stockQuantity && (
                  <p className='text-sm text-destructive'>{errors.stockQuantity.message}</p>
                )}
              </div>
            </div>

            <div className='w-full md:w-[240px] shrink-0 flex flex-col gap-3'>
              <Label className='font-semibold'>{t('fields.image.label')}</Label>
              <div className='relative w-full aspect-square border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden hover:bg-slate-100 transition-colors group cursor-pointer'>
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt='Preview'
                      className='w-full h-full object-contain'
                    />
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
                    htmlFor='variantImage'
                    className='flex flex-col items-center gap-2 cursor-pointer text-muted-foreground w-full h-full justify-center'
                  >
                    <ImagePlus className='w-8 h-8' />
                    <span className='text-xs'>{t('fields.image.placeholder')}</span>
                  </label>
                )}
                <input
                  id='variantImage'
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleImageChange}
                />
              </div>
              {errors.image && (
                <p className='text-sm text-destructive text-center'>
                  {errors.image.message as string}
                </p>
              )}
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onSuccess}>
              {t('actions.cancel')}
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              <Layers className='mr-2 h-4 w-4' />
              {t('actions.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
