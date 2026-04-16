import {
  createProductSchema,
  type CreateProductFormValues
} from '@/components/admin/data/manage-product/schema/product.schema'
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
import { ACCEPTED_IMAGE_TYPES } from '@/defines/upload-image'
import { useFetchData } from '@/hooks/useFetchData'
import {
  createProductApi,
  createProductSpecificationApi,
  uploadProductImagesApi
} from '@/services/product/product.api'
import { getAllCategoryApi } from '@/services/category/category.api'
import { getAllBrandApi } from '@/services/brand/brand.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { FolderPlus, ImagePlus, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { getAllTagApi } from '@/services/tag/tag.api'
import { CREATE_SPECIFICATION_FIELDS } from '@/components/admin/data/manage-product/product.config'

interface CreateProductFormProps {
  onSuccess: () => void
}

export function CreateProductForm({ onSuccess }: CreateProductFormProps) {
  const { t } = useTranslation('product')
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { warrantyMonths: 12, tagIds: [], categoryId: '', brandId: '' }
  })

  const { data: categories = [] } = useFetchData('categories', getAllCategoryApi)
  const { data: brands = [] } = useFetchData('brands', getAllBrandApi)
  const { data: tags = [] } = useFetchData('tags', getAllTagApi)

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [imagePreviews, setImagePreviews] = useState<{ url: string; file: File }[]>([])

  const onSubmit = async (data: CreateProductFormValues) => {
    try {
      setIsSubmitting(true)

      const resProduct = await createProductApi({
        productName: data.productName,
        slug: data.slug,
        productDesc: data.productDesc,
        warrantyMonths: data.warrantyMonths,
        categoryId: data.categoryId,
        brandId: data.brandId,
        tagIds: data.tagIds
      })

      const newProductId = resProduct.data?.id

      if (newProductId) {
        if (data.thumbnail || imagePreviews.length > 0) {
          await uploadProductImagesApi({
            productId: newProductId,
            thumbnail: data.thumbnail,
            images: imagePreviews.map((img) => img.file)
          })
        }

        const specData = data.specification
        const hasSpecData =
          specData && Object.values(specData).some((val) => val !== undefined && val !== '')

        if (hasSpecData) {
          await createProductSpecificationApi(newProductId, specData)
        }
      }

      const successMessage = resProduct.message || t('message.success.create')
      toast.success(successMessage)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onSuccess()
    } catch (error: unknown) {
      let errorMessage = t('message.error.create')

      if (isAxiosError(error)) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      file
    }))

    setImagePreviews((prev) => [...prev, ...newPreviews])
    setValue('images', [...imagePreviews.map((i) => i.file), ...files])
  }

  const removeImage = (indexToRemove: number) => {
    const updatedPreviews = imagePreviews.filter((_, index) => index !== indexToRemove)
    setImagePreviews(updatedPreviews)
    setValue(
      'images',
      updatedPreviews.map((i) => i.file)
    )
  }

  return (
    <Card className='border-none shadow-none px-5'>
      <CardHeader className='px-0 pt-0'>
        <div className='flex items-center gap-2'>
          <FolderPlus className='h-5 w-5 text-primary' />
          <CardTitle>{t('titles.create')}</CardTitle>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className='px-0 pt-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* BỌC TOÀN BỘ FORM VÀO GRID 3 CỘT (Màn hình to thì 3 cột, màn hình nhỏ thành 1 cột) */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* ==== CỘT TRÁI (Chiếm 2 phần) ==== */}
            <div className='lg:col-span-2 space-y-6'>
              {/* SECTION 1: THÔNG TIN CƠ BẢN */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>{t('sections.basicInfo')}</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label>{t('fields.productName.label')}</Label>
                    <Input
                      placeholder={t('fields.productName.placeholder')}
                      {...register('productName')}
                    />
                    {errors.productName && (
                      <p className='text-sm text-destructive'>{errors.productName.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>{t('fields.slug.label')}</Label>
                    <Input placeholder={t('fields.slug.placeholder')} {...register('slug')} />
                    {errors.slug && (
                      <p className='text-sm text-destructive'>{errors.slug.message}</p>
                    )}
                  </div>

                  <div className='space-y-2 md:col-span-2'>
                    <Label>{t('fields.productDesc.label')}</Label>
                    <textarea
                      placeholder={t('fields.productDesc.placeholder')}
                      {...register('productDesc')}
                      className='flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* SECTION 2: PHÂN LOẠI & HIỂN THỊ */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>{t('sections.classification')}</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='space-y-2'>
                    <Label>{t('fields.categoryId.label')}</Label>
                    <Controller
                      control={control}
                      name='categoryId'
                      render={({ field }) => (
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('fields.categoryId.placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.categoryName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.categoryId && (
                      <p className='text-sm text-destructive'>{errors.categoryId.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>{t('fields.brandId.label')}</Label>
                    <Controller
                      control={control}
                      name='brandId'
                      render={({ field }) => (
                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('fields.brandId.placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.brandName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.brandId && (
                      <p className='text-sm text-destructive'>{errors.brandId.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>{t('fields.warrantyMonths.label')}</Label>
                    <Input
                      type='number'
                      min={0}
                      {...register('warrantyMonths', { valueAsNumber: true })}
                    />
                  </div>

                  <div className='space-y-3 md:col-span-3'>
                    <Label>{t('fields.tagIds.label')}</Label>
                    <Controller
                      control={control}
                      name='tagIds'
                      render={({ field }) => {
                        const toggleTag = (tagId: string) => {
                          const currentTags = field.value || []
                          const isSelected = currentTags.includes(tagId)
                          const newTags = isSelected
                            ? currentTags.filter((id) => id !== tagId)
                            : [...currentTags, tagId]
                          field.onChange(newTags)
                        }

                        return (
                          <div className='flex flex-wrap gap-2'>
                            {tags.length > 0 ? (
                              tags.map((tag) => {
                                const isSelected = field.value?.includes(tag.id)
                                return (
                                  <button
                                    type='button'
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                      isSelected
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background text-muted-foreground hover:bg-muted'
                                    }`}
                                  >
                                    {tag.tagName}
                                  </button>
                                )
                              })
                            ) : (
                              <span className='text-sm text-muted-foreground italic'>
                                Không có nhãn nào.
                              </span>
                            )}
                          </div>
                        )
                      }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* SECTION 3: HÌNH ẢNH */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>{t('sections.images')}</h3>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                  <div className='space-y-2 col-span-1'>
                    <Label>{t('fields.thumbnail.label')}</Label>
                    <label
                      htmlFor='thumbnail'
                      className={`block w-full aspect-square rounded-md border bg-muted overflow-hidden cursor-pointer relative group ${errors.thumbnail ? 'border-destructive' : ''}`}
                    >
                      {thumbnailPreview ? (
                        <>
                          <img
                            src={thumbnailPreview}
                            className='object-cover w-full h-full'
                            alt='Thumbnail'
                          />
                          <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm font-medium' />
                        </>
                      ) : (
                        <div className='flex flex-col items-center justify-center h-full text-muted-foreground text-sm'>
                          <ImagePlus className='h-8 w-8 mb-2 opacity-50' />
                          {t('actions.upload')}
                        </div>
                      )}
                    </label>
                    <Input
                      id='thumbnail'
                      type='file'
                      accept={ACCEPTED_IMAGE_TYPES.join(',')}
                      className='hidden'
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setThumbnailPreview(URL.createObjectURL(file))
                        setValue('thumbnail', file, { shouldValidate: true })
                      }}
                    />
                    {errors.thumbnail && (
                      <p className='text-sm text-destructive'>
                        {errors.thumbnail.message as string}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2 col-span-3'>
                    <Label>{t('fields.images.label')}</Label>
                    <div className='grid grid-cols-4 gap-4'>
                      {imagePreviews.map((img, index) => (
                        <div
                          key={index}
                          className='relative aspect-square rounded-md border bg-muted overflow-hidden group'
                        >
                          <img
                            src={img.url}
                            className='object-cover w-full h-full'
                            alt={`Detail ${index}`}
                          />
                          <button
                            type='button'
                            onClick={() => removeImage(index)}
                            className='absolute top-1 right-1 bg-destructive/80 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            <X className='h-4 w-4' />
                          </button>
                        </div>
                      ))}
                      <label
                        htmlFor='images'
                        className={`flex flex-col items-center justify-center aspect-square rounded-md border border-dashed hover:bg-muted/50 cursor-pointer transition-colors ${errors.images ? 'border-destructive' : ''}`}
                      >
                        <ImagePlus className='h-6 w-6 mb-2 text-muted-foreground' />
                        <span className='text-xs text-muted-foreground'>
                          {t('actions.addImage')}
                        </span>
                      </label>
                    </div>
                    <Input
                      id='images'
                      type='file'
                      multiple
                      accept={ACCEPTED_IMAGE_TYPES.join(',')}
                      className='hidden'
                      onChange={handleImagesChange}
                    />
                    {errors.images && (
                      <p className='text-sm text-destructive'>{errors.images.message as string}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ==== CỘT PHẢI (Chiếm 1 phần) ==== */}
            <div className='lg:col-span-1 border-l lg:pl-8 space-y-6'>
              {/* SECTION 4: THÔNG SỐ KỸ THUẬT */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>{t('sections.specification')}</h3>
                <div className='grid grid-cols-2 gap-x-3 gap-y-4'>
                  {CREATE_SPECIFICATION_FIELDS.map((field) => (
                    <div key={field.id} className='space-y-2'>
                      <Label
                        className='text-[11px] leading-tight text-muted-foreground line-clamp-1'
                        title={t(`fields.specification.${field.label}`)}
                      >
                        {t(`fields.specification.${field.label}`)}
                      </Label>
                      <Input
                        className='h-8 px-2 text-sm'
                        {...register(`specification.${field.id}`)}
                      />
                    </div>
                  ))}

                  <div className='space-y-2'>
                    <Label className='text-[11px] text-muted-foreground'>
                      {t('fields.specification.releaseDate')}
                    </Label>
                    <Input
                      className='h-8 px-2 text-sm'
                      type='date'
                      {...register('specification.releaseDate')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onSuccess}>
              {t('actions.cancel')}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? t('actions.saving') : t('actions.submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
