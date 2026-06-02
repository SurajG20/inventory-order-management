import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ComposedChart,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { SkeletonBox } from '@/components/shared/Skeleton'

interface RevenueTrendProps {
  data: { month: string; revenue: number }[]
  isLoading?: boolean
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  )
}

export function RevenueTrend({ data, isLoading = false }: RevenueTrendProps) {
  if (isLoading) {
    return <SkeletonBox className="h-[300px] w-full rounded-lg" />
  }

  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border bg-card">
        <p className="text-sm text-muted-foreground">No revenue data</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
          strokeWidth={0.5}
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fontFamily: 'Inter', fill: '#94a3b8' }}
          dy={8}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fontFamily: 'Inter', fill: '#94a3b8' }}
          tickFormatter={(value: number) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              minimumFractionDigits: 0,
            }).format(value)
          }
          dx={-4}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          fill="url(#revenueArea)"
          stroke="none"
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#6366f1' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
