import {
  createReceiptSchema,
  type CreateReceiptFormValues
} from '@/components/admin/data/manage-receipt/schema/receipt.schema'
import { ReceiptDetailRow } from '@/components/admin/data/manage-receipt/create/ReceiptDetailRow'
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
import { useAppMutation } from '@/hooks/useAppMutation'
import { useFetchData } from '@/hooks/useFetchData'
import { getAllProductsApi } from '@/services/product/product.api'
import { createManualReceiptApi, getAllSuppliersApi } from '@/services/receipt/receipt.api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Save } from 'lucide-react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface CreateManualReceiptFormProps {
  onSuccess: () => void
}

export function CreateManualReceiptForm({ onSuccess }: CreateManualReceiptFormProps) {
  const { t } = useTranslation('receipt')

  const { data: suppliers = [] } = useFetchData('suppliers', getAllSuppliersApi)
  const { data: products = [] } = useFetchData('products', getAllProductsApi)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CreateReceiptFormValues>({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: {
      supplierId: '',
      note: '',
      details: [{ productId: '', variantId: '', quantity: 1, importPrice: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details'
  })

  const watchDetails = useWatch({ control, name: 'details' })
  const totalInvoiceAmount = watchDetails.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.importPrice || 0),
    0
  )

  const mutation = useAppMutation(
    createManualReceiptApi,
    'receipts',
    t('message.success.create'),
    t('message.error.create'),
    onSuccess
  )

  const onSubmit = (data: CreateReceiptFormValues) => {
    const payload = {
      supplierId: data.supplierId,
      note: data.note,
      details: data.details.map((d) => ({
        variantId: d.variantId,
        quantity: d.quantity,
        importPrice: d.importPrice
      }))
    }
    mutation.mutate(payload)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* THÔNG TIN CHUNG */}
      <div className='grid grid-cols-2 gap-4 bg-muted/10 p-4 rounded-md border'>
        <div className='space-y-2'>
          <Label>
            {t('fields.supplier.label')} <span className='text-destructive'>*</span>
          </Label>
          <Controller
            control={control}
            name='supplierId'
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={errors.supplierId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('fields.supplier.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.supplierId && (
            <p className='text-sm text-destructive'>{errors.supplierId.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>{t('fields.note.label')}</Label>
          <Controller
            control={control}
            name='note'
            render={({ field }) => <Input placeholder={t('fields.note.placeholder')} {...field} />}
          />
        </div>
      </div>

      {/* DANH SÁCH CHI TIẾT */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label className='text-base font-semibold'>Danh sách sản phẩm nhập</Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => append({ productId: '', variantId: '', quantity: 1, importPrice: 0 })}
          >
            <Plus className='h-4 w-4 mr-1' /> Thêm dòng
          </Button>
        </div>

        {/* Tiêu đề cột */}
        <div className='grid grid-cols-12 gap-3 px-3 text-xs font-semibold text-muted-foreground uppercase'>
          <div className='col-span-3'>{t('fields.product')}</div>
          <div className='col-span-3'>Phân loại (Biến thể)</div>
          <div className='col-span-2'>{t('fields.quantity')}</div>
          <div className='col-span-2'>{t('fields.importPrice')}</div>
          <div className='col-span-2'>{t('fields.totalPrice')}</div>
        </div>

        {/* Các dòng nhập liệu */}
        <div className='space-y-2 max-h-[40vh] overflow-y-auto pr-1'>
          {fields.map((field, index) => (
            <ReceiptDetailRow
              key={field.id}
              index={index}
              control={control}
              setValue={setValue}
              remove={remove}
              products={products}
            />
          ))}
          {fields.length === 0 && (
            <div className='text-center py-8 text-sm text-muted-foreground bg-muted/10 rounded border border-dashed'>
              Chưa có sản phẩm nào. Vui lòng bấm "Thêm dòng".
            </div>
          )}
        </div>
        {errors.details?.root && (
          <p className='text-sm text-destructive'>{errors.details.root.message}</p>
        )}
        {errors.details && !errors.details.root && (
          <p className='text-sm text-destructive'>Vui lòng điền đầy đủ thông tin các dòng.</p>
        )}
      </div>

      {/* TỔNG KẾT & NÚT LƯU */}
      <div className='flex items-center justify-between pt-4 border-t'>
        <div className='text-lg'>
          {t('table.columns.totalAmount')}:{' '}
          <span className='font-bold text-destructive text-xl ml-2'>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              totalInvoiceAmount
            )}
          </span>
        </div>
        <Button type='submit' disabled={mutation.isPending}>
          <Save className='mr-2 h-4 w-4' />
          {t('actions.create')}
        </Button>
      </div>
    </form>
  )
}
