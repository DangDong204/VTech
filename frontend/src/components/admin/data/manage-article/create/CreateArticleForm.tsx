import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { ImageIcon, Loader2, X, Send, ShoppingBag, Check } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArticleEditor } from './ArticleEditor'
import { ArticleStatus } from '@/defines/enum/article.enum'
import type { CreateArticlePayload } from '@/services/article/article.type'
import { uploadArticleImageApi } from '@/services/article/article.api'
import { cn } from '@/lib/utils'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllProductsApi } from '@/services/product/product.api'

const articleSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(255, 'Tiêu đề quá dài'),
  summary: z.string().max(500, 'Tóm tắt không được quá 500 ký tự').optional(),
  content: z.string().min(1, 'Nội dung không được để trống'),
  status: z.nativeEnum(ArticleStatus),
  thumbnail: z.string().nullable().optional(),
  productIds: z.array(z.string()).optional()
})

type ArticleFormValues = z.infer<typeof articleSchema>

interface CreateArticleFormProps {
  defaultValues?: Partial<ArticleFormValues>
  onSubmit: (data: CreateArticlePayload) => void
  isLoading?: boolean
  submitLabel?: string
}

export function CreateArticleForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel
}: CreateArticleFormProps) {
  const { t } = useTranslation('article')
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    typeof defaultValues?.thumbnail === 'string' ? defaultValues.thumbnail : null
  )
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      status: ArticleStatus.DRAFT,
      thumbnail: null,
      productIds: [],
      ...defaultValues
    }
  })

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const localPreview = URL.createObjectURL(file)
    setThumbnailPreview(localPreview)
    setIsUploadingThumbnail(true)
    try {
      const s3Url = await uploadArticleImageApi(file)
      setValue('thumbnail', s3Url)
      URL.revokeObjectURL(localPreview)
      setThumbnailPreview(s3Url)
      toast.success('Tải ảnh đại diện thành công')
    } catch {
      toast.error('Tải ảnh đại diện thất bại')
      setThumbnailPreview(null)
      setValue('thumbnail', null)
    } finally {
      setIsUploadingThumbnail(false)
      e.target.value = ''
    }
  }

  const removeThumbnail = () => {
    setValue('thumbnail', null)
    setThumbnailPreview(null)
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
  }

  const handleFormSubmit = (values: ArticleFormValues) => {
    onSubmit({
      title: values.title,
      summary: values.summary,
      content: values.content,
      status: values.status,
      thumbnail: values.thumbnail ?? null,
      productIds: values.productIds ?? []
    })
  }

  const { data: products = [] } = useFetchData('products', getAllProductsApi)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* CỘT TRÁI: CONTENT (Col span 8) */}
        <div className='lg:col-span-8 space-y-6'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='title' className='text-base font-semibold'>
              {t('form.title')} <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='title'
              placeholder={t('form.titlePlaceholder')}
              {...register('title')}
              className={cn(
                'text-lg font-medium h-12',
                errors.title && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            {errors.title && <p className='text-xs text-destructive'>{errors.title.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='text-base font-semibold'>
              {t('form.content')} <span className='text-destructive'>*</span>
            </Label>
            <Controller
              name='content'
              control={control}
              render={({ field }) => (
                <ArticleEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('form.contentPlaceholder')}
                  error={!!errors.content}
                  className='min-h-[450px]'
                />
              )}
            />
            {errors.content && <p className='text-xs text-destructive'>{errors.content.message}</p>}
          </div>
        </div>

        {/* CỘT PHẢI: SIDEBAR (Col span 4) */}
        <div className='lg:col-span-4 space-y-6'>
          {/* Trạng thái & Hành động */}
          <div className='rounded-lg border bg-card p-4 space-y-4 shadow-sm'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-1 h-4 bg-primary rounded-full' />
              <h3 className='font-bold text-sm uppercase tracking-wider text-muted-foreground'>
                Xuất bản
              </h3>
            </div>

            <div className='flex flex-col gap-2'>
              <Label className='text-sm font-medium'>{t('form.status')}</Label>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ArticleStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`filters.status.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <Separator />
            <Button
              type='submit'
              disabled={isLoading || isUploadingThumbnail}
              className='w-full h-11 text-base'
            >
              {isLoading ? (
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
              ) : (
                <Send className='mr-2 h-5 w-5' />
              )}
              {isLoading ? t('form.saving') : (submitLabel ?? t('form.submit'))}
            </Button>
          </div>

          {/* Thumbnail */}
          <div className='rounded-lg border bg-card p-4 space-y-4 shadow-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-1 h-4 bg-primary rounded-full' />
              <h3 className='font-bold text-sm uppercase tracking-wider text-muted-foreground'>
                {t('form.thumbnail')}
              </h3>
            </div>

            <input
              ref={thumbnailInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleThumbnailChange}
              disabled={isUploadingThumbnail}
            />

            {thumbnailPreview ? (
              <div className='group relative aspect-video w-full overflow-hidden rounded-md border bg-muted'>
                <img
                  src={thumbnailPreview}
                  alt='Thumbnail'
                  className='h-full w-full object-cover'
                />
                {isUploadingThumbnail && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
                    <Loader2 className='h-6 w-6 animate-spin text-white' />
                  </div>
                )}
                {!isUploadingThumbnail && (
                  <button
                    type='button'
                    onClick={removeThumbnail}
                    className='absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>
            ) : (
              <button
                type='button'
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isUploadingThumbnail}
                className='flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 text-muted-foreground transition-all hover:bg-muted/60 disabled:opacity-50'
              >
                <ImageIcon className='h-10 w-10 stroke-1' />
                <span className='text-xs font-medium'>{t('form.thumbnailUpload')}</span>
              </button>
            )}
          </div>

          {/* Gắn sản phẩm (Linked Products) */}
          <div className='rounded-lg border bg-card p-4 space-y-4 shadow-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-1 h-4 bg-primary rounded-full' />
              <h3 className='font-bold text-sm uppercase tracking-wider text-muted-foreground'>
                Sản phẩm liên kết
              </h3>
            </div>

            <Controller
              name='productIds'
              control={control}
              render={({ field }) => {
                const selectedProducts = products.filter((p) => field.value?.includes(p.id))

                return (
                  <div className='flex flex-col gap-3'>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          className='w-full justify-start text-muted-foreground font-normal border-dashed'
                        >
                          <ShoppingBag className='mr-2 h-4 w-4' />+ Thêm sản phẩm...
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className='w-[--radix-popover-trigger-width] p-0'
                        align='start'
                      >
                        <Command>
                          <CommandInput placeholder='Tìm kiếm sản phẩm...' />
                          {/* SỬA Ở ĐÂY: Chuyển max-h-80 lên CommandList */}
                          <CommandList className='max-h-80'>
                            <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                            {/* SỬA Ở ĐÂY: Bỏ overflow-auto và max-h ở CommandGroup đi */}
                            <CommandGroup>
                              {products.map((product) => {
                                const isSelected = field.value?.includes(product.id)
                                return (
                                  <CommandItem
                                    key={product.id}
                                    value={product.productName}
                                    onSelect={() => {
                                      const newValue = isSelected
                                        ? field.value?.filter((id) => id !== product.id)
                                        : [...(field.value || []), product.id]
                                      field.onChange(newValue)
                                    }}
                                  >
                                    {/* ... Code UI bên trong giữ nguyên ... */}
                                    <div className='flex items-center gap-3 w-full'>
                                      {product.images?.thumbnail ? (
                                        <img
                                          src={product.images.thumbnail}
                                          alt=''
                                          className='w-8 h-8 rounded border object-cover shrink-0'
                                        />
                                      ) : (
                                        <div className='w-8 h-8 rounded border bg-muted shrink-0 flex items-center justify-center'>
                                          <ImageIcon className='h-4 w-4 text-muted-foreground' />
                                        </div>
                                      )}
                                      <span className='flex-1 truncate font-medium'>
                                        {product.productName}
                                      </span>
                                      {isSelected && (
                                        <Check className='h-4 w-4 text-primary shrink-0' />
                                      )}
                                    </div>
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Mở rộng max-w của viên Badge để không bị cắt xén quá mức */}
                    {selectedProducts.length > 0 && (
                      <div className='flex flex-wrap gap-2 pt-2'>
                        {selectedProducts.map((product) => (
                          <Badge
                            key={product.id}
                            variant='secondary'
                            className='flex items-center gap-1.5 pl-3 pr-2 py-1.5'
                          >
                            <span
                              className='truncate max-w-[280px] font-normal'
                              title={product.productName}
                            >
                              {product.productName}
                            </span>
                            <div
                              role='button'
                              className='rounded-full hover:bg-muted p-0.5 cursor-pointer text-muted-foreground hover:text-destructive transition-colors'
                              onClick={() =>
                                field.onChange(field.value?.filter((id) => id !== product.id))
                              }
                            >
                              <X className='h-3.5 w-3.5' />
                            </div>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className='text-[10.5px] leading-tight text-muted-foreground italic mt-1'>
                      Khách hàng có thể nhấn vào các sản phẩm này ngay dưới bài viết.
                    </p>
                  </div>
                )
              }}
            />
          </div>

          {/* Summary */}
          <div className='rounded-lg border bg-card p-4 space-y-4 shadow-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-1 h-4 bg-primary rounded-full' />
              <h3 className='font-bold text-sm uppercase tracking-wider text-muted-foreground'>
                {t('form.summary')}
              </h3>
            </div>
            <Textarea
              id='summary'
              placeholder={t('form.summaryPlaceholder')}
              rows={4}
              {...register('summary')}
              className={cn(
                'resize-none text-sm',
                errors.summary && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            {errors.summary && <p className='text-xs text-destructive'>{errors.summary.message}</p>}
            <p className='text-[10px] text-muted-foreground text-right italic'>
              Gợi ý: Tóm tắt khoảng 150-200 ký tự sẽ hiển thị đẹp nhất trên trang danh sách.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
