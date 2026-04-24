import { ProductSpecificationForm } from '@/components/admin/data/manage-product/ProductSpecificationForm'
import { ProductStatusBadge } from '@/components/admin/data/manage-product/ProductStatusBadges'
import {
  updateProductSchema,
  type UpdateProductFormValues
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
import { ProductStatus } from '@/defines/enum/product.enum'
import { ACCEPTED_IMAGE_TYPES } from '@/defines/upload-image'
import { useFetchData } from '@/hooks/useFetchData'
import type { Product } from '@/pages/admin/manage-product/columns'
import { getAllBrandApi } from '@/services/brand/brand.api'
import { getAllCategoryApi } from '@/services/category/category.api'
import {
  deleteProductImageApi,
  updateProductApi,
  updateProductSpecificationApi,
  uploadProductImagesApi
} from '@/services/product/product.api'
import { getAllTagApi } from '@/services/tag/tag.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { FolderPen, ImagePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm, FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface EditProductFormProps {
  onSuccess: () => void
  product: Product
}

export function EditProductForm({ onSuccess, product }: EditProductFormProps) {
  const { t } = useTranslation('product')
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: categories = [] } = useFetchData('categories', getAllCategoryApi)
  const { data: brands = [] } = useFetchData('brands', getAllBrandApi)
  const { data: tags = [] } = useFetchData('tags', getAllTagApi)

  // Chuyển đổi dữ liệu Spec từ JSON (Backend) sang mảng (Frontend)
  // Dữ liệu spec từ Backend đã là Mảng sẵn, nên ta gán thẳng luôn
  const initialSpecs = product.specification?.attributes || []

  const methods = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      productName: product.productName,
      slug: product.slug,
      productDesc: product.productDesc || '',
      warrantyMonths: product.warrantyMonths || 0,
      status: product.status,
      categoryId: product.categoryId,
      brandId: product.brandId,
      tagIds: [],
      specs: initialSpecs // Gắn trực tiếp mảng vào đây
    }
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = methods

  // === STATE QUẢN LÝ ẢNH ===
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    product.images?.thumbnail || null
  )
  const [imagePreviews, setImagePreviews] = useState<
    { url: string; file?: File; isOld?: boolean }[]
  >(product.images?.images?.map((url) => ({ url, isOld: true })) || [])

  const [deletedOldImages, setDeletedOldImages] = useState<string[]>([])

  // Ánh xạ Tags
  useEffect(() => {
    if (tags.length > 0 && product.tags && product.tags.length > 0) {
      const tagIdArray = product.tags
        .map((tagName) => tags.find((t) => t.tagName === tagName)?.id)
        .filter((id) => id !== undefined) as string[]

      setValue('tagIds', tagIdArray, { shouldValidate: true })
    }
  }, [tags, product.tags, setValue])

  // === LOGIC XỬ LÝ ẢNH ===
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      isOld: false
    }))

    setImagePreviews((prev) => [...prev, ...newPreviews])

    const currentFiles = (control._formValues.images || []) as File[]
    setValue('images', [...currentFiles, ...files])
  }

  const removeImage = (indexToRemove: number) => {
    const targetImg = imagePreviews[indexToRemove]

    if (targetImg.isOld) {
      setDeletedOldImages((prev) => [...prev, targetImg.url])
    }

    const updatedPreviews = imagePreviews.filter((_, index) => index !== indexToRemove)
    setImagePreviews(updatedPreviews)

    const remainingNewFiles = updatedPreviews
      .filter((img) => !img.isOld && img.file)
      .map((img) => img.file as File)
    setValue('images', remainingNewFiles)
  }

  // === SUBMIT FORM ===
  const onSubmit = async (data: UpdateProductFormValues) => {
    try {
      setIsSubmitting(true)

      // 1. Cập nhật thông tin cơ bản
      await updateProductApi(product.id, {
        productName: data.productName,
        slug: data.slug,
        productDesc: data.productDesc,
        warrantyMonths: data.warrantyMonths,
        categoryId: data.categoryId,
        brandId: data.brandId,
        tagIds: data.tagIds,
        status: data.status
      })

      // 2. GỌI API XÓA CÁC ẢNH CŨ BỊ ẤN X
      if (deletedOldImages.length > 0) {
        await Promise.all(deletedOldImages.map((url) => deleteProductImageApi(product.id, url)))
      }

      // 3. Upload ảnh mới
      const newImages = imagePreviews
        .filter((img) => !img.isOld && img.file)
        .map((img) => img.file as File)

      if (data.thumbnail || newImages.length > 0) {
        await uploadProductImagesApi({
          productId: product.id,
          thumbnail: data.thumbnail,
          images: newImages.length > 0 ? newImages : undefined
        })
      }

      // 4. Cập nhật Specification (Giữ nguyên trật tự mảng)
      const validSpecs =
        data.specs?.filter((spec) => spec.label.trim() !== '' && spec.value.trim() !== '') || []

      // Bắn toàn bộ mảng lên để chèn đè mảng cũ trong DB
      const specPayload = { attributes: validSpecs }
      await updateProductSpecificationApi(product.id, specPayload)

      toast.success(t('message.success.update'))
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onSuccess()
    } catch (error: unknown) {
      let errorMessage = t('message.error.update')
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className='border-none shadow-none px-5'>
      <CardHeader className='px-0 pt-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FolderPen className='h-5 w-5 text-primary' />
            <CardTitle>{t('titles.edit')}</CardTitle>
          </div>
          <ProductStatusBadge status={product.status} />
        </div>
      </CardHeader>

      <Separator />

      <CardContent className='px-0 pt-6'>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* ==== CỘT TRÁI (Chiếm 2 phần) ==== */}
              <div className='lg:col-span-2 space-y-6'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>{t('sections.basicInfo')}</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label>{t('fields.productName.label')}</Label>
                      <Input {...register('productName')} />
                      {errors.productName && (
                        <p className='text-sm text-destructive'>{errors.productName.message}</p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label>{t('fields.slug.label')}</Label>
                      <Input {...register('slug')} />
                      {errors.slug && (
                        <p className='text-sm text-destructive'>{errors.slug.message}</p>
                      )}
                    </div>

                    <div className='space-y-2 md:col-span-2'>
                      <Label>{t('fields.productDesc.label')}</Label>
                      <textarea
                        {...register('productDesc')}
                        className='flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className='space-y-4'>
                  <h3 className='text-lg font-medium'>{t('sections.classification')}</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='space-y-2'>
                      <Label>{t('fields.categoryId.label')}</Label>
                      <Controller
                        control={control}
                        name='categoryId'
                        render={({ field }) => (
                          <Select value={field.value || ''} onValueChange={field.onChange}>
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
                          <Select value={field.value || ''} onValueChange={field.onChange}>
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
                      <Label>{t('fields.status.label')}</Label>
                      <Controller
                        control={control}
                        name='status'
                        render={({ field }) => (
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(ProductStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {t(`fields.status.options.${status}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>{t('fields.warrantyMonths.label')}</Label>
                      <Input
                        type='number'
                        min={0}
                        {...register('warrantyMonths', { valueAsNumber: true })}
                      />
                    </div>

                    <div className='space-y-3 md:col-span-2'>
                      <Label>{t('fields.tagIds.label')}</Label>
                      <Controller
                        control={control}
                        name='tagIds'
                        render={({ field }) => {
                          const toggleTag = (tagId: string) => {
                            const currentTags = field.value || []
                            const isSelected = currentTags.includes(tagId)
                            field.onChange(
                              isSelected
                                ? currentTags.filter((id) => id !== tagId)
                                : [...currentTags, tagId]
                            )
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
                          className={`relative group overflow-hidden flex flex-col items-center justify-center aspect-square rounded-md border border-dashed cursor-pointer transition-colors ${errors.images ? 'border-destructive' : 'hover:border-primary/50'}`}
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
                        <p className='text-sm text-destructive'>
                          {errors.images.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ==== CỘT PHẢI (Chiếm 1 phần) ==== */}
              <div className='lg:col-span-1 border-l lg:pl-8 space-y-6'>
                {/* COMPONENT THÔNG SỐ KỸ THUẬT ĐỘNG */}
                <ProductSpecificationForm />
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
        </FormProvider>
      </CardContent>
    </Card>
  )
}
