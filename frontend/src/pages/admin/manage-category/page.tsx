import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-category/columns'
import { DataTable } from '@/pages/admin/manage-category/data-table'
import { getAllCategoryApi } from '@/services/category/category.api'
import { useTranslation } from 'react-i18next'

export default function CategoryPage() {
  const { t } = useTranslation('category')

  const { data, isLoading } = useFetchData('categories', getAllCategoryApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibolds'>{t('titles.list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data} />}
    </div>
  )
}
