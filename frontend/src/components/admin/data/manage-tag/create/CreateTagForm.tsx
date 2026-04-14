import {
  createTagSchema,
  type CreateTagFormValues
} from '@/components/admin/data/manage-tag/schema/tag.schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAppMutation } from '@/hooks/useAppMutation'
import { createTagApi } from '@/services/tag/tag.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { FolderPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface CreateTagFormProps {
  onSuccess: () => void
}

export function CreateTagForm({ onSuccess }: CreateTagFormProps) {
  const { t } = useTranslation('tag')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateTagFormValues>({
    resolver: zodResolver(createTagSchema)
  })

  const mutation = useAppMutation(
    createTagApi,
    'tags',
    t('message.success.create'),
    t('message.error.create'),
    onSuccess
  )

  const onSubmit = (data: CreateTagFormValues) => {
    mutation.mutate(data)
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
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>{t('fields.tagName.label')}</Label>
              <Input
                placeholder={t('fields.tagName.placeholder')}
                {...register('tagName')}
                className={errors.tagName ? 'border-destructive' : ''}
              />
              {errors.tagName && (
                <p className='text-sm text-destructive'>{errors.tagName.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label>{t('fields.tagDesc.label')}</Label>
              <Input placeholder={t('fields.tagDesc.placeholder')} {...register('tagDesc')} />
              {errors.tagDesc && (
                <p className='text-sm text-destructive'>{errors.tagDesc.message}</p>
              )}
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
