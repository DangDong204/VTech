import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getVariantsByProductIdApi } from '@/services/product-variant/variant.api'
import type { ProductVariantResponse } from '@/services/product-variant/variant.type'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useWatch, type Control, type UseFormSetValue } from 'react-hook-form'
import type { CreateReceiptFormValues } from '../schema/receipt.schema'
import type { ProductResponse } from '@/services/product/product.type'

interface ReceiptDetailRowProps {
  index: number
  control: Control<CreateReceiptFormValues>
  setValue: UseFormSetValue<CreateReceiptFormValues>
  remove: (index: number) => void
  products: ProductResponse[]
}

export function ReceiptDetailRow({
  index,
  control,
  setValue,
  remove,
  products
}: ReceiptDetailRowProps) {
  // Lắng nghe sự thay đổi của productId trên dòng này
  const productId = useWatch({ control, name: `details.${index}.productId` })
  const quantity = useWatch({ control, name: `details.${index}.quantity` }) || 0
  const importPrice = useWatch({ control, name: `details.${index}.importPrice` }) || 0

  const [variants, setVariants] = useState<ProductVariantResponse[]>([])
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)

  // Fetch variants khi productId thay đổi
  useEffect(() => {
    let isMounted = true
    const fetchVariants = async () => {
      if (productId) {
        setIsLoadingVariants(true)
        try {
          const res = await getVariantsByProductIdApi(productId)
          if (isMounted) setVariants(res)
        } catch {
          if (isMounted) setVariants([])
        } finally {
          if (isMounted) setIsLoadingVariants(false)
        }
      } else {
        if (isMounted) setVariants([])
      }
    }

    fetchVariants()

    return () => {
      isMounted = false
    }
  }, [productId])

  const totalPrice = quantity * importPrice

  return (
    <div className='grid grid-cols-12 gap-3 items-start bg-muted/20 p-3 rounded-md border border-dashed'>
      {/* 1. Chọn Sản phẩm */}
      <div className='col-span-3 space-y-1'>
        <Controller
          control={control}
          name={`details.${index}.productId`}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val)
                // Khi đổi sản phẩm, phải reset lại biến thể đã chọn trước đó
                setValue(`details.${index}.variantId`, '')
              }}
            >
              <SelectTrigger className='bg-background'>
                <SelectValue placeholder='Chọn SP gốc...' />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.productName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* 2. Chọn Biến thể */}
      <div className='col-span-3 space-y-1'>
        <Controller
          control={control}
          name={`details.${index}.variantId`}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!productId || isLoadingVariants}
            >
              <SelectTrigger className='bg-background'>
                <SelectValue
                  placeholder={isLoadingVariants ? 'Đang tải...' : 'Chọn phân loại...'}
                />
              </SelectTrigger>
              <SelectContent>
                {variants.length === 0 ? (
                  <div className='p-2 text-sm text-muted-foreground text-center'>
                    Không có biến thể
                  </div>
                ) : (
                  variants.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.versionName} - {v.colorName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* 3. Số lượng */}
      <div className='col-span-2 space-y-1'>
        <Controller
          control={control}
          name={`details.${index}.quantity`}
          render={({ field }) => (
            <Input
              type='number'
              min={1}
              className='bg-background'
              placeholder='SL'
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
      </div>

      {/* 4. Giá nhập */}
      <div className='col-span-2 space-y-1'>
        <Controller
          control={control}
          name={`details.${index}.importPrice`}
          render={({ field }) => (
            <Input
              type='number'
              min={0}
              className='bg-background'
              placeholder='Giá nhập'
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
      </div>

      {/* 5. Thành tiền & Xóa */}
      <div className='col-span-2 flex items-center justify-between pl-2'>
        <span className='font-semibold text-destructive text-sm'>
          {new Intl.NumberFormat('vi-VN').format(totalPrice)}đ
        </span>
        <Button
          variant='ghost'
          size='icon'
          className='text-muted-foreground hover:text-red-500 hover:bg-red-50'
          onClick={() => remove(index)}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
