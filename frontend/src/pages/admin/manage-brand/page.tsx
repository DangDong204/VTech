import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-brand/columns'
import { DataTable } from '@/pages/admin/manage-brand/data-table'
import { getAllBrandApi } from '@/services/brand/brand.api'
import { useTranslation } from 'react-i18next'

export default function BrandPage() {
  const { t } = useTranslation('brand')

  const { data, isLoading } = useFetchData('brands', getAllBrandApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibolds'>{t('titles.list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data} />}
    </div>
  )
}
