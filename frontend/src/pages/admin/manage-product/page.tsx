import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-product/columns'
import { DataTable } from '@/pages/admin/manage-product/data-table'
import { getAllProductsApi } from '@/services/product/product.api'
import { useTranslation } from 'react-i18next'

export default function ProductPage() {
  const { t } = useTranslation('product')

  const { data, isLoading } = useFetchData('products', getAllProductsApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibolds'>{t('titles.list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data} />}
    </div>
  )
}
