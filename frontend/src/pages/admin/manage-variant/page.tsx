import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { Button } from '@/components/ui/button'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-variant/columns'
import { DataTable } from '@/pages/admin/manage-variant/data-table'
import { getVariantsByProductIdApi } from '@/services/product-variant/variant.api'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

export default function VariantPage() {
  const { t } = useTranslation('variant')

  const { productId } = useParams<{ productId: string }>()

  const { data, isLoading } = useFetchData(
    ['variants', productId],
    () => getVariantsByProductIdApi(productId as string),
    { enabled: !!productId }
  )

  const productName = data && data.length > 0 ? data[0].productName : 'Sản phẩm'

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='icon' asChild>
            <Link to='/dashboard/products' title={t('titles.back')}>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl bg-secondary font-bold tracking-tight'>{t('titles.list')}</h1>
            <p className='text-muted-foreground'>{productName}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <DataTable columns={columns} data={data || []} productId={productId as string} />
      )}
    </div>
  )
}
