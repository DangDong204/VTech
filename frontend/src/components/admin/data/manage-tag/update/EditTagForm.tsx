import {
  editTagSchema,
  type EditTagFormValues
} from '@/components/admin/data/manage-tag/schema/tag.schema'
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
import { TagStatus } from '@/defines/enum/tag.enum'
import { useAppMutation } from '@/hooks/useAppMutation'
import type { Tag } from '@/pages/admin/manage-tag/columns'
import { updateTagApi } from '@/services/tag/tag.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface EditTagFormProps {
  tag: Tag
  onSuccess: () => void
}

export function EditTagForm({ tag, onSuccess }: EditTagFormProps) {
  const { t } = useTranslation('tag')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<EditTagFormValues & { status: string }>({
    resolver: zodResolver(editTagSchema),
    defaultValues: {
      tagName: tag.tagName,
      tagDesc: tag.tagDesc ?? '',
      status: tag.status
    }
  })

  const mutation = useAppMutation(
    (values: EditTagFormValues) => updateTagApi(tag.id, values),
    'tags',
    t('message.success.update'),
    t('message.error.update'),
    onSuccess
  )

  const onSubmit = (values: EditTagFormValues & { status: string }) => {
    mutation.mutate(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label>{t('fields.tagName.label')}</Label>
        <Input {...register('tagName')} />
        {errors.tagName && <p className='text-destructive text-sm'>{errors.tagName.message}</p>}
      </div>

      <div className='space-y-2'>
        <Label>{t('fields.tagDesc.label')}</Label>
        <Input {...register('tagDesc')} />
        {errors.tagDesc && <p className='text-destructive text-sm'>{errors.tagDesc.message}</p>}
      </div>

      {/* STATUS */}
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
                {Object.values(TagStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`fields.status.options.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className='flex justify-end'>
        <Button type='submit' disabled={mutation.isPending}>
          {t('actions.edit')}
        </Button>
      </div>
    </form>
  )
}
