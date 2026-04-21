import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface ProductSortBarProps {
  totalProducts: number
  currentSort: string
  onSortChange: (value: string) => void
}

export function ProductSortBar({ totalProducts, currentSort, onSortChange }: ProductSortBarProps) {
  const { t } = useTranslation('common')

  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card border border-border rounded-lg p-3 mb-4 gap-3'>
      <div className='text-sm text-muted-foreground'>
        Tìm thấy <span className='font-bold text-foreground'>{totalProducts}</span> sản phẩm
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm font-medium'>{t('common.sort')}:</span>
        <Select value={currentSort} onValueChange={onSortChange}>
          <SelectTrigger className='w-[180px] h-9'>
            <SelectValue placeholder='Sắp xếp theo' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='newest'>Mới nhất</SelectItem>
            <SelectItem value='price_asc'>Giá: Thấp đến Cao</SelectItem>
            <SelectItem value='price_desc'>Giá: Cao đến Thấp</SelectItem>
            <SelectItem value='rating'>Đánh giá cao</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
