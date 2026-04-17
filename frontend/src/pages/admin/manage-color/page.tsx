import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-color/columns'
import { DataTable } from '@/pages/admin/manage-color/data-table'
import { getAllColorApi } from '@/services/color/color.api'
import { useTranslation } from 'react-i18next'

export default function ColorPage() {
  const { t } = useTranslation('color')
  const { data, isLoading } = useFetchData('colors', getAllColorApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibold'>{t('titles.list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
