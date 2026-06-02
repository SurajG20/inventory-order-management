import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { SkeletonBox } from '@/components/shared/Skeleton'

interface StockDistributionProps {
  data: { status: string; count: number }[]
  isLoading?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  in_stock: '#22c55e',
  low_stock: '#f59e0b',
  out_of_stock: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { name: string; value: number; payload: { status: string } }[]
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-slate-500">
        {STATUS_LABELS[entry.payload.status] ?? entry.name}
      </p>
      <p className="text-sm font-semibold text-slate-900">
        {entry.value.toLocaleString()} items
      </p>
    </div>
  )
}

function renderLegend(value: string) {
  return (
    <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#64748b', marginLeft: 8 }}>
      {STATUS_LABELS[value] ?? value}
    </span>
  )
}

export function StockDistribution({
  data,
  isLoading = false,
}: StockDistributionProps) {
  if (isLoading) {
    return <SkeletonBox className="h-[300px] w-full rounded-lg" />
  }

  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border bg-card">
        <p className="text-sm text-muted-foreground">No stock data</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] ?? '#94a3b8'}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="middle"
            align="right"
            layout="vertical"
            iconType="circle"
            iconSize={8}
            formatter={renderLegend}
            wrapperStyle={{ fontFamily: 'Inter', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {total.toLocaleString()}
        </span>
        <span className="text-xs text-slate-400">Total Items</span>
      </div>
    </div>
  )
}
