import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-promotion/columns'
import { DataTable } from '@/pages/admin/manage-promotion/data-table'
import { getAllPromotionApi } from '@/services/promotion/promotion.api'
import { useTranslation } from 'react-i18next'

export default function PromotionPage() {
  const { t } = useTranslation('promotion')

  const { data, isLoading } = useFetchData('promotions', getAllPromotionApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibolds'>{t('titles.list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data} />}
    </div>
  )
}
