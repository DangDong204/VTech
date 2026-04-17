import {
  colorSchema,
  type ColorFormValues
} from '@/components/admin/data/manage-color/schema/color.schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAppMutation } from '@/hooks/useAppMutation'
import { createColorApi } from '@/services/color/color.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Palette } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface CreateColorFormProps {
  onSuccess: () => void
}

export function CreateColorForm({ onSuccess }: CreateColorFormProps) {
  const { t } = useTranslation('color')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ColorFormValues>({
    resolver: zodResolver(colorSchema)
  })

  const hexCodeValue = watch('hexCode')

  const mutation = useAppMutation(
    createColorApi,
    'colors',
    t('message.success.create'),
    t('message.error.create'),
    onSuccess
  )

  const onSubmit = async (data: ColorFormValues) => {
    mutation.mutate(data)
  }

  return (
    <Card className='border-none shadow-none px-5'>
      <CardHeader className='px-0 pt-0'>
        <div className='flex items-center gap-2'>
          <Palette className='h-5 w-5 text-primary' />
          <CardTitle>{t('titles.create')}</CardTitle>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className='px-0 pt-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-6'>
              <div className='space-y-2'>
                <Label>{t('fields.colorName.label')}</Label>
                <Input
                  placeholder={t('fields.colorName.placeholder')}
                  {...register('colorName')}
                  className={errors.colorName ? 'border-destructive' : ''}
                />
                {errors.colorName && (
                  <p className='text-sm text-destructive'>{errors.colorName.message}</p>
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
                    placeholder={t('fields.hexCode.placeholder')}
                    {...register('hexCode')}
                    className={`uppercase ${errors.hexCode ? 'border-destructive' : ''}`}
                    onChange={(e) => {
                      setValue('hexCode', e.target.value.toUpperCase(), {
                        shouldValidate: true
                      })
                    }}
                  />
                </div>
                {errors.hexCode && (
                  <p className='text-sm text-destructive'>{errors.hexCode.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='button' variant='outline' onClick={onSuccess}>
              {t('actions.cancel')}
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              <Palette className='mr-2 h-4 w-4' />
              {t('actions.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
