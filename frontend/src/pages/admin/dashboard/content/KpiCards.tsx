import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Skeleton } from '@/components/ui/skeleton'
import { getKpiDataApi, type KpiData } from '@/services/dashboard/dashboard.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const icons = [DollarSign, ShoppingCart, Package, Users]

type Period = 'day' | 'week' | 'month'

export default function KpiCards() {
  const { t } = useTranslation('dashboard') // Khởi tạo i18n với namespace 'dashboard'
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<KpiData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mapping các nhãn thời gian kỳ trước
  const periodLabel: Record<Period, string> = {
    day: t('kpi.period.yesterday'),
    week: t('kpi.period.lastWeek'),
    month: t('kpi.period.lastMonth')
  }

  // Hàm helper để dịch các label do Backend trả về
  const translateApiLabel = (label: string) => {
    const labelMap: Record<string, string> = {
      'Doanh thu': t('kpi.labels.revenue'),
      'Đơn hàng': t('kpi.labels.orders'),
      'Sản phẩm đã bán': t('kpi.labels.productsSold'),
      'Khách hàng mới': t('kpi.labels.newCustomers')
    }
    return labelMap[label] || label // Fallback về label gốc nếu không tìm thấy
  }

  useEffect(() => {
    const fetchKpi = async () => {
      setIsLoading(true)
      try {
        const result = await getKpiDataApi(period)
        setData(result)
      } catch (error) {
        toast.error(t('kpi.error_fetch'))
      } finally {
        setIsLoading(false)
      }
    }
    fetchKpi()
  }, [period, t])

  return (
    <div className='space-y-3'>
      {/* Period filter */}
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-medium text-muted-foreground'>{t('kpi.title')}</h2>
        <ToggleGroup
          type='single'
          value={period}
          onValueChange={(val) => val && setPeriod(val as Period)}
          className='h-8 rounded-md border bg-muted p-0.5'
        >
          <ToggleGroupItem
            value='day'
            className='h-7 rounded-sm px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm'
          >
            {t('kpi.filter.day')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value='week'
            className='h-7 rounded-sm px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm'
          >
            {t('kpi.filter.week')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value='month'
            className='h-7 rounded-sm px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm'
          >
            {t('kpi.filter.month')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Cards */}
      <div className='grid grid-cols-2 gap-3 xl:grid-cols-4'>
        {isLoading
          ? // Hiển thị Skeleton khi đang loading
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className='overflow-hidden border bg-card shadow-none'>
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-8 w-8 rounded-md' />
                  </div>
                  <Skeleton className='h-8 w-32 mt-2' />
                  <Skeleton className='h-4 w-24 mt-2' />
                </CardContent>
              </Card>
            ))
          : data.map((kpi, i) => {
              const Icon = icons[i]
              const isPositive = kpi.change >= 0
              const TrendIcon = isPositive ? TrendingUp : TrendingDown

              return (
                <Card key={kpi.label} className='overflow-hidden border bg-card shadow-none'>
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between'>
                      {/* Áp dụng hàm dịch label API */}
                      <p className='text-xs font-medium text-muted-foreground'>
                        {translateApiLabel(kpi.label)}
                      </p>
                      <div className='flex h-8 w-8 items-center justify-center rounded-md bg-red-100/50 dark:bg-red-900/20'>
                        <Icon className='h-4 w-4 text-red-600 dark:text-red-500' />
                      </div>
                    </div>

                    <div className='mt-2'>
                      <p className='text-2xl font-semibold tracking-tight'>
                        {kpi.value}
                        {kpi.suffix && (
                          <span className='ml-1 text-sm font-normal text-muted-foreground'>
                            {kpi.suffix}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className='mt-2 flex items-center gap-1.5'>
                      <div
                        className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        }`}
                      >
                        <TrendIcon className='h-3 w-3' />
                        {Math.abs(kpi.change)}%
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {t('kpi.compared_to')} {periodLabel[period]}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>
    </div>
  )
}
