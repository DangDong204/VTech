import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-tag/columns'
import { DataTable } from '@/pages/admin/manage-tag/data-table'
import { getAllTagApi } from '@/services/tag/tag.api'
import { useTranslation } from 'react-i18next'

export default function TagPage() {
  const { t } = useTranslation('tag')

  const { data, isLoading } = useFetchData('tags', getAllTagApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibolds'>{t('titles.list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data} />}
    </div>
  )
}
