import { UserTableSkeleton } from '@/components/common/LoadingTable'
import { useFetchData } from '@/hooks/useFetchData'
import { columns } from './columns'
import { DataTable } from './data-table'
import { getAdminArticlesApi } from '@/services/article/article.api'
import { useTranslation } from 'react-i18next'

export default function ArticlePage() {
  const { t } = useTranslation('article')

  const { data, isLoading } = useFetchData('articles', getAdminArticlesApi)

  return (
    <div>
      <div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
        <h1 className='font-semibold'>{t('titles.list')}</h1>
      </div>
      {isLoading ? <UserTableSkeleton /> : <DataTable columns={columns} data={data || []} />}
    </div>
  )
}
