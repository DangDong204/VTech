import {
  editVoucherSchema,
  type EditVoucherFormValues
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
import { updateVoucherApi } from '@/services/voucher/voucher.api'
import type { VoucherResponse } from '@/services/voucher/voucher.type'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, TicketPlus } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface EditVoucherFormProps {
  voucher: VoucherResponse
  onSuccess: () => void
}

// Hàm convert từ "dd-MM-yyyy HH:mm:ss" sang "yyyy-MM-ddThh:mm" cho thẻ input
const parseDateForInput = (dateString?: string | null) => {
  if (!dateString) return ''
  const [datePart, timePart] = dateString.split(' ')
  if (!datePart || !timePart) return ''

  const [day, month, year] = datePart.split('-')
  const [hour, minute] = timePart.split(':')

  return `${year}-${month}-${day}T${hour}:${minute}`
}

export function EditVoucherForm({ voucher, onSuccess }: EditVoucherFormProps) {
  const { t } = useTranslation('voucher')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<EditVoucherFormValues>({
    resolver: zodResolver(editVoucherSchema),
    defaultValues: {
      voucherCode: voucher.voucherCode,
      voucherName: voucher.voucherName,
      type: voucher.type,
      status: voucher.status,
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue,
      maxDiscountAmount: voucher.maxDiscountAmount ?? null,
      usageLimit: voucher.usageLimit ?? null,
      requiredPoints: voucher.requiredPoints ?? 0,
      startDate: parseDateForInput(voucher.startDate),
      endDate: parseDateForInput(voucher.endDate)
    }
  })

  const mutation = useAppMutation(
    (values: EditVoucherFormValues) => updateVoucherApi(voucher.id, values),
    'vouchers',
    t('message.success.update'),
    t('message.error.update'),
    onSuccess
  )

  const onSubmit = (values: EditVoucherFormValues) => {
    mutation.mutate(values)
  }

  return (
    <Card className='border-none shadow-none px-0 sm:px-2'>
      <CardHeader className='px-0 pt-0'>
        <div className='flex items-center gap-2'>
          <TicketPlus className='h-5 w-5 text-primary' />
          <CardTitle>{t('titles.edit')}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className='px-0 pt-2'>
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
                  {...register('discountValue', { valueAsNumber: true })}
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
                  {...register('minOrderValue', { valueAsNumber: true })}
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
                  min={1}
                  step={1}
                  placeholder={t('fields.usageLimit.placeholder')}
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
              {/* Thêm trường Điểm yêu cầu */}
              <div className='space-y-2'>
                <Label>{t('fields.requiredPoints.label')}</Label>
                <Input
                  type='number'
                  min={0}
                  step={100}
                  placeholder={t('fields.requiredPoints.placeholder')}
                  {...register('requiredPoints', {
                    setValueAs: (v) => (v === '' || Number.isNaN(Number(v)) ? 0 : Number(v))
                  })}
                  className={errors.requiredPoints ? 'border-destructive' : ''}
                />
                {errors.requiredPoints && (
                  <p className='text-sm text-destructive'>{errors.requiredPoints.message}</p>
                )}
                <p className='text-[11px] text-muted-foreground italic'>
                  {t('fields.requiredPoints.hint')}
                </p>
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t'>
            <Button type='submit' disabled={mutation.isPending}>
              <Save className='mr-2 h-4 w-4' />
              {t('actions.edit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
