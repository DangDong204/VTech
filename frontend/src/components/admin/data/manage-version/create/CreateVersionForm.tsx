import {
  versionSchema,
  type VersionFormValues
} from '@/components/admin/data/manage-version/schema/version.schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAppMutation } from '@/hooks/useAppMutation'
import { createVersionApi } from '@/services/version/version.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { HardDrive } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface CreateVersionFormProps {
  onSuccess: () => void
}

export function CreateVersionForm({ onSuccess }: CreateVersionFormProps) {
  const { t } = useTranslation('version')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<VersionFormValues>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      versionName: ''
    }
  })

  const mutation = useAppMutation(
    createVersionApi,
    'versions',
    t('message.success.create'),
    t('message.error.create'),
    onSuccess
  )

  const onSubmit = async (data: VersionFormValues) => {
    mutation.mutate(data)
  }

  return (
    <Card className='border-none shadow-none px-5'>
      <CardHeader className='px-0 pt-0'>
        <div className='flex items-center gap-2'>
          <HardDrive className='h-5 w-5 text-primary' />
          <CardTitle>{t('titles.create')}</CardTitle>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className='px-0 pt-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>
                {t('fields.versionName.label')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                placeholder={t('fields.versionName.placeholder')}
                {...register('versionName')}
                className={errors.versionName ? 'border-destructive' : ''}
              />
              {errors.versionName && (
                <p className='text-sm text-destructive'>{errors.versionName.message}</p>
              )}
            </div>
          </div>
          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onSuccess}>
              {t('actions.cancel')}
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              <HardDrive className='mr-2 h-4 w-4' />
              {t('actions.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
