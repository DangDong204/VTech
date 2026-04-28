import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Skeleton } from '@/components/ui/skeleton'
import { getTopProductsApi, type TopProductData } from '@/services/dashboard/dashboard.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

type Metric = 'revenue' | 'orders'

export default function TopProductsBarChart() {
  const { t, i18n } = useTranslation('dashboard')
  const [metric, setMetric] = useState<Metric>('revenue')
  const [data, setData] = useState<(TopProductData & { shortName: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTopProducts = async () => {
      setIsLoading(true)
      try {
        const result = await getTopProductsApi(metric)
        const mapped = result.map((p) => ({
          ...p,
          shortName: p.name.length > 18 ? p.name.slice(0, 17) + '…' : p.name
        }))
        setData(mapped)
      } catch {
        toast.error(t('top_products.error_fetch'))
      } finally {
        setIsLoading(false)
      }
    }
    fetchTopProducts()
  }, [metric, t])

  // TÍNH TOÁN CHIỀU CAO ĐỘNG (Dynamic Height)
  // Mỗi thanh bar chiếm khoảng 45px + 40px cho trục X. Nếu ít quá thì min là 120px.
  const chartHeight = data.length > 0 ? Math.max(data.length * 45 + 40, 120) : 260

  return (
    // XÓA BỎ class 'h-full flex flex-col' để Card tự co giãn theo nội dung
    <Card className='border shadow-none bg-card'>
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
        <div>
          <CardTitle className='text-base font-semibold'>{t('top_products.title')}</CardTitle>
          <CardDescription className='mt-0.5 text-xs'>
            {metric === 'revenue'
              ? t('top_products.subtitle_revenue')
              : t('top_products.subtitle_orders')}
          </CardDescription>
        </div>
        <ToggleGroup
          type='single'
          value={metric}
          onValueChange={(val) => val && setMetric(val as Metric)}
          className='h-8 rounded-md border bg-muted p-0.5'
        >
          <ToggleGroupItem
            value='revenue'
            className='h-7 rounded-sm px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm'
          >
            {t('top_products.revenue')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value='orders'
            className='h-7 rounded-sm px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm'
          >
            {t('top_products.orders')}
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>

      {/* XÓA BỎ class 'flex-1 flex flex-col justify-end' */}
      <CardContent className='pb-4'>
        {isLoading ? (
          <div className='flex flex-col justify-between h-[260px] gap-4 py-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='flex items-center gap-4'>
                <Skeleton className='h-4 w-24 shrink-0' />
                <Skeleton className='h-4 w-full rounded-sm' />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className='flex items-center justify-center h-[120px] text-sm text-muted-foreground'>
            {t('top_products.no_data')}
          </div>
        ) : (
          // TRUYỀN CHIỀU CAO ĐỘNG VÀO ĐÂY
          <ResponsiveContainer width='100%' height={chartHeight}>
            <BarChart
              data={data}
              layout='vertical'
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              barSize={14}
            >
              <CartesianGrid strokeDasharray='3 3' horizontal={false} className='stroke-border' />
              <XAxis
                type='number'
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  if (metric === 'revenue') {
                    if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)}B`
                    if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`
                    return `${v}`
                  }
                  return v
                }}
              />
              <YAxis
                type='category'
                dataKey='shortName'
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={110}
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
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                formatter={(value) => {
                  const num = typeof value === 'number' ? value : Number(value) || 0
                  if (metric === 'revenue') {
                    const formatted = new Intl.NumberFormat(
                      i18n.language === 'vi' ? 'vi-VN' : 'en-US',
                      {
                        style: 'currency',
                        currency: 'VND'
                      }
                    ).format(num)
                    return [formatted, t('top_products.revenue')]
                  }
                  return [
                    `${num.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} ${t('status_chart.orders')}`,
                    t('top_products.orders')
                  ]
                }}
                labelFormatter={(_, payload) => {
                  if (payload && payload.length > 0) {
                    return payload[0].payload.name
                  }
                  return ''
                }}
              />
              <Bar
                dataKey={metric}
                fill='hsl(var(--chart-4))'
                radius={[0, 4, 4, 0]}
                background={{ fill: 'hsl(var(--muted))', opacity: 0.5, radius: 4 }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
