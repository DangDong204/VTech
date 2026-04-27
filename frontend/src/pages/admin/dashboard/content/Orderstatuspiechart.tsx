import { useEffect, useState, useMemo } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getOrderStatusChartApi,
  type OrderStatusChartData
} from '@/services/dashboard/dashboard.api'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const RADIAN = Math.PI / 180

// Tách riêng cấu hình màu ra ngoài (Không chứa Text cứng nữa)
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'var(--status-pending)',
  CONFIRMED: 'var(--status-confirmed)',
  PROCESSING: 'var(--status-processing)',
  SHIPPING: 'var(--status-shipping)',
  DELIVERED: 'var(--status-delivered)',
  CANCELLED: 'var(--status-cancelled)',
  RETURNED: 'var(--status-returned)'
}

function renderCustomLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
  if (
    cx == null ||
    cy == null ||
    midAngle == null ||
    innerRadius == null ||
    outerRadius == null ||
    percent == null
  )
    return null
  if (percent < 0.05) return null

  const cxNum = Number(cx)
  const cyNum = Number(cy)
  const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.55
  const x = cxNum + radius * Math.cos(-midAngle * RADIAN)
  const y = cyNum + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill='white'
      textAnchor='middle'
      dominantBaseline='central'
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

type Period = 'day' | 'week' | 'month'

export default function OrderStatusPieChart() {
  const { t, i18n } = useTranslation('dashboard') // Khởi tạo i18n
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<
    (OrderStatusChartData & { fill: string; translatedName: string })[]
  >([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const result = await getOrderStatusChartApi(period)

        const filteredResult = result.filter((item) => item.value > 0)

        // Map dữ liệu: Dịch tên trạng thái qua i18n và gán màu
        const mappedData = filteredResult.map((item) => ({
          ...item,
          translatedName: t(`status_chart.status.${item.name}`, { defaultValue: item.name }),
          fill: STATUS_COLORS[item.name] || 'var(--status-returned)'
        }))
        setData(mappedData)
      } catch {
        toast.error(t('status_chart.error_fetch'))
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [period, t])

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data])

  return (
    <Card className='border shadow-none flex flex-col h-full bg-card'>
      <CardHeader className='pb-2 flex flex-row items-center justify-between space-y-0'>
        <div>
          <CardTitle className='text-base font-semibold'>{t('status_chart.title')}</CardTitle>
          <CardDescription className='text-xs mt-1'>
            {isLoading ? (
              <Skeleton className='h-4 w-24' />
            ) : (
              <>
                {t('status_chart.total')}{' '}
                <span className='font-medium text-foreground'>
                  {total.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                </span>{' '}
                {t('status_chart.orders')}
              </>
            )}
          </CardDescription>
        </div>

        <Select value={period} onValueChange={(val) => setPeriod(val as Period)}>
          <SelectTrigger className='w-[110px] h-8 text-xs bg-background'>
            <SelectValue placeholder={t('status_chart.select_period')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='day' className='text-xs'>
              {t('status_chart.period.yesterday')}
            </SelectItem>
            <SelectItem value='week' className='text-xs'>
              {t('status_chart.period.last_week')}
            </SelectItem>
            <SelectItem value='month' className='text-xs'>
              {t('status_chart.period.this_month')}
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className='pb-4 flex-1 flex flex-col justify-center'>
        {isLoading ? (
          <div className='flex items-center justify-center h-[260px]'>
            <Skeleton className='h-[200px] w-[200px] rounded-full' />
          </div>
        ) : data.length === 0 ? (
          <div className='flex items-center justify-center h-[260px] text-sm text-muted-foreground'>
            {t('status_chart.no_data')}
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={260}>
            <PieChart margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey='value'
                nameKey='translatedName'
                labelLine={false}
                label={renderCustomLabel}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke='transparent' />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: 12
                }}
                formatter={(value, name) => {
                  const num = typeof value === 'number' ? value : Number(value)
                  const formattedNum = num.toLocaleString(
                    i18n.language === 'vi' ? 'vi-VN' : 'en-US'
                  )
                  return [`${formattedNum} ${t('status_chart.orders')}`, name]
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: 12,
                  paddingTop: 15
                }}
                iconType='circle'
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
