import {
  createCategorySchema,
  type CreateCategoryFormValues
} from '@/components/admin/data/manage-category/schema/category.schema'
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
import { useAppMutation } from '@/hooks/useAppMutation'
import { useFetchData } from '@/hooks/useFetchData'
import { createCategoryApi, getAllCategoryApi } from '@/services/category/category.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { FolderPlus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface CreateCategoryFormProps {
  onSuccess: () => void
}

export function CreateCategoryForm({ onSuccess }: CreateCategoryFormProps) {
  const { t } = useTranslation('category')

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      displayOrder: 1
    }
  })

  const { data: categories = [] } = useFetchData('categories', getAllCategoryApi)

  const mutation = useAppMutation(
    createCategoryApi,
    'categories',
    t('message.success.create'),
    t('message.error.create'),
    onSuccess
  )

  const onSubmit = async (data: CreateCategoryFormValues) => {
    mutation.mutate({
      ...data,
      parentId: data.parentId || null
    })
  }

  const [preview, setPreview] = useState<string | null>(null)

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
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>{t('sections.basicInfo')}</h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='md:col-span-2 space-y-4'>
                <div className='space-y-2'>
                  <Label>{t('fields.categoryName.label')}</Label>
                  <Input
                    placeholder={t('fields.categoryName.placeholder')}
                    {...register('categoryName')}
                    className={errors.categoryName ? 'border-destructive' : ''}
                  />
                  {errors.categoryName && (
                    <p className='text-sm text-destructive'>{errors.categoryName.message}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label>{t('fields.slug.label')}</Label>
                  <Input
                    placeholder={t('fields.slug.placeholder')}
                    {...register('slug')}
                    className={errors.slug ? 'border-destructive' : ''}
                  />
                  {errors.slug && <p className='text-sm text-destructive'>{errors.slug.message}</p>}
                </div>

                <div className='space-y-2'>
                  <Label>{t('fields.categoryDesc.label')}</Label>
                  <Input
                    placeholder={t('fields.categoryDesc.placeholder')}
                    {...register('categoryDesc')}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.thumbnailUrl.label')}</Label>

                <label
                  htmlFor='thumbnail'
                  className={`block w-full aspect-square rounded-md border bg-muted overflow-hidden cursor-pointer relative group
                    ${errors.thumbnail ? 'border-destructive' : ''}`}
                >
                  {preview ? (
                    <img src={preview} className='object-cover w-full h-full' />
                  ) : (
                    <div className='flex items-center justify-center h-full text-muted-foreground text-sm'>
                      {t('fields.thumbnailUrl.placeholder')}
                    </div>
                  )}

                  <div
                    className='absolute inset-0 bg-black/40 opacity-0
                      group-hover:opacity-100 transition
                      flex items-center justify-center
                      text-white text-sm font-medium'
                  ></div>
                </label>

                <Input
                  id='thumbnail'
                  type='file'
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    setPreview(URL.createObjectURL(file))
                    setValue('thumbnail', file, { shouldValidate: true })
                  }}
                />

                {errors.thumbnail && (
                  <p className='text-sm text-destructive'>{errors.thumbnail.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>{t('sections.classification')}</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>{t('fields.parent.label')}</Label>
                <Controller
                  control={control}
                  name='parentId'
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.parent.placeholder')} />
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
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.displayOrder.label')}</Label>
                <Input
                  type='number'
                  min={0}
                  step={1}
                  {...register('displayOrder', { valueAsNumber: true })}
                />

                {errors.displayOrder && (
                  <p className='text-sm text-destructive'>{errors.displayOrder.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='submit' disabled={mutation.isPending}>
              <FolderPlus className='mr-2 h-4 w-4' />
              {t('actions.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
