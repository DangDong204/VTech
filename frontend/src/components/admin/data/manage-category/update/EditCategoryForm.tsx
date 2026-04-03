import {
  editCategorySchema,
  type EditCategoryFormValues
} from '@/components/admin/data/manage-category/schema/category.schema'
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
import { CategoryStatus } from '@/defines/enum/category.enum'
import { ACCEPTED_IMAGE_TYPES } from '@/defines/upload-image'
import { useAppMutation } from '@/hooks/useAppMutation'
import { useFetchData } from '@/hooks/useFetchData'
import type { Category } from '@/pages/admin/manage-category/columns'
import { getAllCategoryApi, updateCategoryApi } from '@/services/category/category.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface EditCategoryFormProps {
  category: Category
  onSuccess: () => void
}

export function EditCategoryForm({ category, onSuccess }: EditCategoryFormProps) {
  const { t } = useTranslation('category')
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors }
  } = useForm<EditCategoryFormValues>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      categoryName: category.categoryName,
      slug: category.slug,
      categoryDesc: category.categoryDesc ?? '',
      parentId: category.parentId ?? null,
      displayOrder: category.displayOrder ?? 1,
      status: category.status
    }
  })

  const { data: categories = [] } = useFetchData('categories', getAllCategoryApi)

  const mutation = useAppMutation(
    (values: EditCategoryFormValues) => updateCategoryApi(category.id, values),
    'categories',
    t('message.success.update'),
    t('message.error.update'),
    onSuccess
  )

  const onSubmit = (values: EditCategoryFormValues) => {
    mutation.mutate(values)
  }

  const [preview, setPreview] = useState<string | null>(category.thumbnailUrl ?? null)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>{t('fields.categoryName.label')}</Label>
          <Input {...register('categoryName')} />
          {errors.categoryName && (
            <p className='text-destructive text-sm'>{errors.categoryName.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.slug.label')}</Label>
          <Input {...register('slug')} />
          {errors.slug && <p className='text-destructive text-sm'>{errors.slug.message}</p>}
        </div>

        <div className='space-y-2 md:col-span-2'>
          <Label>{t('fields.thumbnailUrl.label')}</Label>

          <label
            htmlFor='thumbnail'
            className={`block w-full aspect-video rounded-md border bg-muted overflow-hidden cursor-pointer relative group 
              ${errors.thumbnail ? 'border-destructive' : ''}`}
          >
            {preview ? (
              <img src={preview} className='object-cover w-full h-full' />
            ) : (
              <div className='flex items-center justify-center h-full text-muted-foreground text-sm'>
                {t('fields.thumbnailUrl.placeholder')}
              </div>
            )}

            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm font-medium'></div>
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
            <p className='text-destructive text-sm'>{errors.thumbnail.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.displayOrder.label')}</Label>
          <Input
            type='number'
            min={0}
            step={1}
            {...register('displayOrder', { valueAsNumber: true })}
          />
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.parent.label')}</Label>
          <Controller
            control={control}
            name='parentId'
            render={({ field }) => (
              <Select
                value={field.value ?? 'none'}
                onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('fields.parent.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>{t('fields.parent.none')}</SelectItem>
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
                  {Object.values(CategoryStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`fields.status.options.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className='space-y-2 md:col-span-2'>
          <Label>{t('fields.categoryDesc.label')}</Label>
          <Input {...register('categoryDesc')} />
        </div>
      </div>

      <div className='flex justify-end'>
        <Button type='submit' disabled={mutation.isPending}>
          {t('actions.edit')}
        </Button>
      </div>
    </form>
  )
}
