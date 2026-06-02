import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { SkeletonBox } from '@/components/shared/Skeleton'

interface OrdersTrendProps {
  data: { month: string; orders: number }[]
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
        {payload[0].value.toLocaleString()} orders
      </p>
    </div>
  )
}

export function OrdersTrend({ data, isLoading = false }: OrdersTrendProps) {
  if (isLoading) {
    return <SkeletonBox className="h-[300px] w-full rounded-lg" />
  }

  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border bg-card">
        <p className="text-sm text-muted-foreground">No orders data</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
          allowDecimals={false}
          dx={-4}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: '#f1f5f9' }}
        />
        <Bar dataKey="orders" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((_, index) => (
            <Cell key={index} fill="#6366f1" fillOpacity={0.9} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
