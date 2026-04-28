import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Skeleton } from '@/components/ui/skeleton'
import { getRevenueChartApi, type RevenueChartData } from '@/services/dashboard/dashboard.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

type Period = 'day' | 'week' | 'month'

export default function RevenueAreaChart() {
  const { t, i18n } = useTranslation('dashboard')
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<RevenueChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const periodTitle: Record<Period, string> = {
    month: t('revenue_chart.period.month'),
    week: t('revenue_chart.period.week'),
    day: t('revenue_chart.period.day')
  }

  useEffect(() => {
    const fetchChart = async () => {
      setIsLoading(true)
      try {
        const res = await getRevenueChartApi(period)
        setData(res)
      } catch {
        toast.error(t('revenue_chart.error_fetch'))
      } finally {
        setIsLoading(false)
      }
    }
    fetchChart()
  }, [period, t])

  // Rút gọn các con số hàng chục triệu/tỷ trên trục Y để không bị tràn màn hình
  function formatY(value: number) {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B` // Tỷ
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M` // Triệu
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K` // Nghìn
    return `${value}`
  }

  return (
    <Card className='border shadow-none bg-card h-full flex flex-col'>
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
        <div>
          <CardTitle className='text-base font-semibold'>{t('revenue_chart.title')}</CardTitle>
          <CardDescription className='mt-0.5 text-xs'>
            {t('revenue_chart.subtitle')} {periodTitle[period]}
          </CardDescription>
        </div>
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
            {t('revenue_chart.filter.day')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value='week'
            className='h-7 rounded-sm px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm'
          >
            {t('revenue_chart.filter.week')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value='month'
            className='h-7 rounded-sm px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm'
          >
            {t('revenue_chart.filter.month')}
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>

      <CardContent className='pb-4 flex-1 flex flex-col justify-end'>
        {isLoading ? (
          <div className='flex items-end justify-between h-[260px] gap-2 px-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`w-full rounded-t-sm`}
                style={{ height: `${Math.floor(Math.random() * 60 + 20)}%` }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className='flex items-center justify-center h-[260px] text-sm text-muted-foreground'>
            {t('revenue_chart.no_data')}
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={260}>
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id='gradThisYear' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='hsl(var(--chart-1))' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='hsl(var(--chart-1))' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='gradLastYear' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='hsl(var(--chart-2))' stopOpacity={0.2} />
                  <stop offset='95%' stopColor='hsl(var(--chart-2))' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' className='stroke-border' vertical={false} />
              <XAxis
                dataKey='label'
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tickFormatter={formatY}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                dx={-5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 12,
                  color: 'hsl(var(--popover-foreground))',
                  boxShadow: '0 4px 12px rgba(0,0,0,.08)'
                }}
                labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: 4 }}
                formatter={(value, name) => {
                  // Ép kiểu an toàn bên trong
                  const num = typeof value === 'number' ? value : Number(value) || 0

                  const formatted = new Intl.NumberFormat(
                    i18n.language === 'vi' ? 'vi-VN' : 'en-US',
                    {
                      style: 'currency',
                      currency: 'VND'
                    }
                  ).format(num)

                  const translatedName =
                    name === 'thisYear'
                      ? t('revenue_chart.series.this_period')
                      : t('revenue_chart.series.last_period')

                  return [formatted, translatedName]
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 15 }}
                formatter={(value) =>
                  value === 'thisYear'
                    ? t('revenue_chart.series.this_period')
                    : t('revenue_chart.series.last_period')
                }
              />
              <Area
                type='monotone'
                dataKey='thisYear'
                stroke='hsl(var(--chart-1))'
                strokeWidth={2}
                fill='url(#gradThisYear)'
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--chart-1))' }}
              />
              <Area
                type='monotone'
                dataKey='lastYear'
                stroke='hsl(var(--chart-2))'
                strokeWidth={1.5}
                strokeDasharray='5 3'
                fill='url(#gradLastYear)'
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--chart-2))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
