import {
  createVoucherSchema,
  type CreateVoucherFormValues
} from '@/components/admin/data/manage-voucher/schema/voucher.schema'
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
import { VoucherStatus, VoucherType } from '@/defines/enum/voucher.enum'
import { useAppMutation } from '@/hooks/useAppMutation'
import { createVoucherApi } from '@/services/voucher/voucher.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { TicketPlus } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface CreateVoucherFormProps {
  onSuccess: () => void
}

export function CreateVoucherForm({ onSuccess }: CreateVoucherFormProps) {
  const { t } = useTranslation('voucher')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<CreateVoucherFormValues>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: {
      type: VoucherType.PERCENTAGE,
      status: VoucherStatus.ACTIVE
    }
  })

  const mutation = useAppMutation(
    createVoucherApi,
    'vouchers',
    t('message.success.create'),
    t('message.error.create'),
    onSuccess
  )

  const onSubmit = async (data: CreateVoucherFormValues) => {
    mutation.mutate({
      ...data,
      startDate: data.startDate || null,
      endDate: data.endDate || null
    })
  }

  return (
    <Card className='border-none shadow-none px-5'>
      <CardHeader className='px-0 pt-0'>
        <div className='flex items-center gap-2'>
          <TicketPlus className='h-5 w-5 text-primary' />
          <CardTitle>{t('titles.create')}</CardTitle>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className='px-0 pt-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>{t('sections.basicInfo')}</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>
                  {t('fields.voucherCode.label')} <span className='text-destructive'>*</span>
                </Label>
                <Input
                  placeholder={t('fields.voucherCode.placeholder')}
                  className={`uppercase ${errors.voucherCode ? 'border-destructive' : ''}`}
                  {...register('voucherCode')}
                />
                {errors.voucherCode && (
                  <p className='text-sm text-destructive'>{errors.voucherCode.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>
                  {t('fields.voucherName.label')} <span className='text-destructive'>*</span>
                </Label>
                <Input
                  placeholder={t('fields.voucherName.placeholder')}
                  className={errors.voucherName ? 'border-destructive' : ''}
                  {...register('voucherName')}
                />
                {errors.voucherName && (
                  <p className='text-sm text-destructive'>{errors.voucherName.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.type.label')}</Label>
                <Controller
                  control={control}
                  name='type'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.type.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(VoucherType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`fields.type.options.${type}`)}
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
                        <SelectValue placeholder={t('fields.status.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={VoucherStatus.ACTIVE}>
                          {t('fields.status.options.ACTIVE')}
                        </SelectItem>
                        <SelectItem value={VoucherStatus.INACTIVE}>
                          {t('fields.status.options.INACTIVE')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* KHỐI 2: ĐIỀU KIỆN ÁP DỤNG & THỜI GIAN */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>{t('sections.conditions')}</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>
                  {t('fields.discountValue.label')} <span className='text-destructive'>*</span>
                </Label>
                <Input
                  type='number'
                  min={0}
                  step={1}
                  placeholder={t('fields.discountValue.placeholder')}
                  {...register('discountValue', { valueAsNumber: true })} // Ép kiểu số
                  className={errors.discountValue ? 'border-destructive' : ''}
                />
                {errors.discountValue && (
                  <p className='text-sm text-destructive'>{errors.discountValue.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.maxDiscountAmount.label')}</Label>
                <Input
                  type='number'
                  min={0}
                  step={1}
                  placeholder={t('fields.maxDiscountAmount.placeholder')}
                  // Với trường optional, nếu để trống (chuỗi rỗng) hoặc NaN thì gán là null
                  {...register('maxDiscountAmount', {
                    setValueAs: (v) => (v === '' || Number.isNaN(Number(v)) ? null : Number(v))
                  })}
                  className={errors.maxDiscountAmount ? 'border-destructive' : ''}
                />
                {errors.maxDiscountAmount && (
                  <p className='text-sm text-destructive'>{errors.maxDiscountAmount.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>
                  {t('fields.minOrderValue.label')} <span className='text-destructive'>*</span>
                </Label>
                <Input
                  type='number'
                  min={0}
                  step={1}
                  placeholder={t('fields.minOrderValue.placeholder')}
                  {...register('minOrderValue', { valueAsNumber: true })} // Ép kiểu số
                  className={errors.minOrderValue ? 'border-destructive' : ''}
                />
                {errors.minOrderValue && (
                  <p className='text-sm text-destructive'>{errors.minOrderValue.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>{t('fields.usageLimit.label')}</Label>
                <Input
                  type='number'
                  min={0}
                  step={1}
                  placeholder={t('fields.usageLimit.placeholder')}
                  // Với trường optional, nếu để trống thì gán là null
                  {...register('usageLimit', {
                    setValueAs: (v) => (v === '' || Number.isNaN(Number(v)) ? null : Number(v))
                  })}
                  className={errors.usageLimit ? 'border-destructive' : ''}
                />
                {errors.usageLimit && (
                  <p className='text-sm text-destructive'>{errors.usageLimit.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>
                  {t('fields.startDate.label')} <span className='text-destructive'>*</span>
                </Label>
                <Input
                  type='datetime-local'
                  {...register('startDate')}
                  className={errors.startDate ? 'border-destructive' : ''}
                />
                {errors.startDate && (
                  <p className='text-sm text-destructive'>{errors.startDate.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label>
                  {t('fields.endDate.label')} <span className='text-destructive'>*</span>
                </Label>
                <Input
                  type='datetime-local'
                  {...register('endDate')}
                  className={errors.endDate ? 'border-destructive' : ''}
                />
                {errors.endDate && (
                  <p className='text-sm text-destructive'>{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='submit' disabled={mutation.isPending}>
              <TicketPlus className='mr-2 h-4 w-4' />
              {t('actions.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
