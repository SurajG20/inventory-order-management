import { cn } from '@/lib/utils'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />
}

interface SkeletonLineProps {
  width?: string
  className?: string
}

function SkeletonLine({ width = 'w-full', className }: SkeletonLineProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted h-4', width, className)}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3">
      <SkeletonLine width="w-1/3" className="h-5" />
      <SkeletonLine width="w-1/2" />
      <SkeletonLine width="w-2/3" />
    </div>
  )
}

function SkeletonTable({ rows = 8, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      <div className="border-b">
        <div className="flex h-12 items-center gap-4 px-4">
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonLine
              key={i}
              width={i === 0 ? 'w-1/3' : 'w-24'}
              className="h-3"
            />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex items-center gap-4 px-4 py-3.5 border-b border-border/50">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <SkeletonLine
              key={colIdx}
              width={colIdx === 0 ? 'w-[30%]' : 'w-20'}
              className="h-3.5"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { SkeletonBox, SkeletonLine, SkeletonCard, SkeletonTable }
