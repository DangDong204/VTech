import {
  versionSchema,
  type VersionFormValues
} from '@/components/admin/data/manage-version/schema/version.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppMutation } from '@/hooks/useAppMutation'
import type { VersionResponse } from '@/services/version/version.type'
import { updateVersionApi } from '@/services/version/version.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface EditVersionFormProps {
  version: VersionResponse
  onSuccess: () => void
}

export function EditVersionForm({ version, onSuccess }: EditVersionFormProps) {
  const { t } = useTranslation('version')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<VersionFormValues>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      versionName: version.versionName
    }
  })

  const mutation = useAppMutation(
    (values: VersionFormValues) => updateVersionApi(version.id, values),
    'versions',
    t('message.success.update'),
    t('message.error.update'),
    onSuccess
  )

  const onSubmit = (values: VersionFormValues) => {
    mutation.mutate(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
      <div className='space-y-2'>
        <Label>
          {t('fields.versionName.label')} <span className='text-destructive'>*</span>
        </Label>
        <Input {...register('versionName')} />
        {errors.versionName && (
          <p className='text-destructive text-sm'>{errors.versionName.message}</p>
        )}
      </div>

      <div className='flex justify-end gap-2 pt-4'>
        <Button type='button' variant='outline' onClick={onSuccess}>
          {t('actions.cancel')}
        </Button>
        <Button type='submit' disabled={mutation.isPending}>
          {t('actions.edit')}
        </Button>
      </div>
    </form>
  )
}
