import { type ElementType } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SkeletonBox, SkeletonLine } from '@/components/shared/Skeleton'

interface StatsCardProps {
  icon?: ElementType
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  isLoading?: boolean
  className?: string
}

export function StatsCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  isLoading = false,
  className,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-card p-5 space-y-3',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-8 w-8 rounded-lg" />
          <SkeletonLine width="w-20" className="h-3.5" />
        </div>
        <SkeletonLine width="w-1/2" className="h-7" />
        <SkeletonLine width="w-2/3" className="h-3" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : null}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
        </div>
        {trend ? (
          <div
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium rounded-full px-2 py-0.5',
              trend.isPositive
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-red-600 bg-red-50'
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        ) : null}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
      </div>
      {subtitle ? (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  )
}
