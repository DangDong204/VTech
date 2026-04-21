import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from '@/pages/admin/manage-voucher/columns'
import { DataTable } from '@/pages/admin/manage-voucher/data-table'
import { getAllVoucherApi } from '@/services/voucher/voucher.api'
import { useTranslation } from 'react-i18next'

export default function VoucherPage() {
  const { t } = useTranslation('voucher')

  const { data, isLoading } = useFetchData('vouchers', getAllVoucherApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibold'>{t('titles.list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data} />}
    </div>
  )
}
