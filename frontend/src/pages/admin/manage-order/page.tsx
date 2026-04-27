import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { columns } from '@/pages/admin/manage-order/columns'
import { DataTable } from '@/pages/admin/manage-order/data-table'
import { getAllOrdersAdminApi } from '@/services/order/order.api'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

export default function OrderPage() {
  const { t } = useTranslation('order')

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getAllOrdersAdminApi
  })

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibolds'>{t('titles.list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
