import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-receipt/colums'
import { DataTable } from '@/pages/admin/manage-receipt/data-table'
import { getAllReceiptsApi } from '@/services/receipt/receipt.api'
import { useTranslation } from 'react-i18next'

export default function ReceiptPage() {
  const { t } = useTranslation('receipt')
  const { data, isLoading } = useFetchData('receipts', getAllReceiptsApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibold'>{t('titles.list')}</h1>
      </div>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <div>
          <DataTable columns={columns} data={data || []} />
        </div>
      )}
    </div>
  )
}
