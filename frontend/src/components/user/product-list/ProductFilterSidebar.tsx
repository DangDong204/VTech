import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

export function ProductFilterSidebar() {
  const { t } = useTranslation('common')

  // Giả lập data, sau này lấy từ API Categories/Brands
  const categories = ['Điện thoại', 'Laptop', 'Phụ kiện', 'Tablet']
  const prices = ['Dưới 5 triệu', '5 - 15 triệu', '15 - 25 triệu', 'Trên 25 triệu']

  return (
    <div className='bg-card border border-border rounded-lg p-4 sticky top-20'>
      <h2 className='font-bold text-lg mb-4'>{t('common.filter')}</h2>

      {/* Lọc theo danh mục */}
      <div className='space-y-3'>
        <h3 className='font-medium text-sm text-muted-foreground'>Danh mục</h3>
        {categories.map((cat) => (
          <div key={cat} className='flex items-center space-x-2'>
            <Checkbox id={`cat-${cat}`} />
            <Label htmlFor={`cat-${cat}`} className='text-sm font-normal cursor-pointer'>
              {cat}
            </Label>
          </div>
        ))}
      </div>

      <Separator className='my-4' />

      {/* Lọc theo giá */}
      <div className='space-y-3'>
        <h3 className='font-medium text-sm text-muted-foreground'>Mức giá</h3>
        {prices.map((price) => (
          <div key={price} className='flex items-center space-x-2'>
            <Checkbox id={`price-${price}`} />
            <Label htmlFor={`price-${price}`} className='text-sm font-normal cursor-pointer'>
              {price}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
