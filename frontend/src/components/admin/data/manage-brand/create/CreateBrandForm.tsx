import {
  createBrandSchema,
  type CreateBrandFormValues
} from '@/components/admin/data/manage-brand/schema/brand.schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ACCEPTED_IMAGE_TYPES } from '@/defines/upload-image'
import { useAppMutation } from '@/hooks/useAppMutation'
import { createBrandApi } from '@/services/brand/brand.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { FolderPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface CreateBrandFormProps {
  onSuccess: () => void
}

export function CreateBrandForm({ onSuccess }: CreateBrandFormProps) {
  const { t } = useTranslation('brand')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CreateBrandFormValues>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      displayOrder: 1
    }
  })

  const mutation = useAppMutation(
    createBrandApi,
    'brands',
    t('message.success.create'),
    t('message.error.create'),
    onSuccess
  )

  const onSubmit = async (data: CreateBrandFormValues) => {
    mutation.mutate({
      ...data
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
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='md:col-span-2 space-y-4'>
                <div className='space-y-2'>
                  <Label>{t('fields.brandName.label')}</Label>
                  <Input
                    placeholder={t('fields.brandName.placeholder')}
                    {...register('brandName')}
                    className={errors.brandName ? 'border-destructive' : ''}
                  />
                  {errors.brandName && (
                    <p className='text-sm text-destructive'>{errors.brandName.message}</p>
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
                  <Label>{t('fields.brandDesc.label')}</Label>
                  <Input
                    placeholder={t('fields.brandDesc.placeholder')}
                    {...register('brandDesc')}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.brandLogo.label')}</Label>

                <label
                  htmlFor='brandLogo'
                  className={`block w-full aspect-video rounded-md border bg-muted overflow-hidden cursor-pointer relative group
                    ${errors.brandLogo ? 'border-destructive' : ''}`}
                >
                  {preview ? (
                    <img src={preview} className='object-cover w-full h-full' />
                  ) : (
                    <div className='flex items-center justify-center h-full text-muted-foreground text-sm'>
                      {t('fields.brandLogo.placeholder')}
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
                  id='brandLogo'
                  type='file'
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return

                    setPreview(URL.createObjectURL(file))
                    setValue('brandLogo', file, { shouldValidate: true })
                  }}
                />

                {errors.brandLogo && (
                  <p className='text-sm text-destructive'>{errors.brandLogo.message}</p>
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
