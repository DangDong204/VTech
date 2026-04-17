import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-version/columns'
import { DataTable } from '@/pages/admin/manage-version/data-table'
import { getAllVersionApi } from '@/services/version/version.api'
import { useTranslation } from 'react-i18next'

export default function VersionPage() {
  const { t } = useTranslation('version')
  const { data, isLoading } = useFetchData('versions', getAllVersionApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibold'>{t('titles.list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
