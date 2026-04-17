import {
  colorSchema,
  type ColorFormValues
} from '@/components/admin/data/manage-color/schema/color.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppMutation } from '@/hooks/useAppMutation'
import type { Color } from '@/pages/admin/manage-color/columns'
import { updateColorApi } from '@/services/color/color.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface EditColorFormProps {
  color: Color
  onSuccess: () => void
}

export function EditColorForm({ color, onSuccess }: EditColorFormProps) {
  const { t } = useTranslation('color')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ColorFormValues>({
    resolver: zodResolver(colorSchema),
    defaultValues: {
      colorName: color.colorName,
      hexCode: color.hexCode || ''
    }
  })

  const hexCodeValue = watch('hexCode')

  const mutation = useAppMutation(
    (values: ColorFormValues) => updateColorApi(color.id, values),
    'colors',
    t('message.success.update'),
    t('message.error.update'),
    onSuccess
  )

  const onSubmit = (values: ColorFormValues) => {
    mutation.mutate(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>{t('fields.colorName.label')}</Label>
          <Input {...register('colorName')} />
          {errors.colorName && (
            <p className='text-destructive text-sm'>{errors.colorName.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>
            {t('fields.hexCode.label')} <span className='text-destructive'>*</span>
          </Label>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 shrink-0 overflow-hidden rounded-md border p-1'>
              <input
                type='color'
                className='h-full w-full cursor-pointer border-0 p-0 bg-transparent'
                value={hexCodeValue || '#000000'}
                onChange={(e) => {
                  setValue('hexCode', e.target.value.toUpperCase(), {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                }}
              />
            </div>
            <Input
              className={`uppercase ${errors.hexCode ? 'border-destructive' : ''}`}
              {...register('hexCode')}
              onChange={(e) => {
                setValue('hexCode', e.target.value.toUpperCase(), {
                  shouldValidate: true
                })
              }}
            />
          </div>
          {errors.hexCode && <p className='text-destructive text-sm'>{errors.hexCode.message}</p>}
        </div>
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
