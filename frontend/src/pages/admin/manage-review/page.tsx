import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-review/columns'
import { DataTable } from '@/pages/admin/manage-review/data-table'
import { getAdminReviewsApi } from '@/services/review/review.api'
import { useTranslation } from 'react-i18next'

export default function ReviewPage() {
  const { t } = useTranslation('review')

  const { data, isLoading } = useFetchData('admin-reviews', getAdminReviewsApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibolds'>{t('titles.list')}</h1>
      </div>

      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
