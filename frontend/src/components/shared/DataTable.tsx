import { type ChangeEvent, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { SkeletonTable } from '@/components/shared/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'

export interface Column<T> {
  key: keyof T
  header: string
  render?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  isLoading?: boolean
  emptyStateIcon?: React.ElementType
  emptyStateTitle?: string
  emptyStateDescription?: string
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  isLoading = false,
  emptyStateIcon,
  emptyStateTitle = 'No results found',
  emptyStateDescription = 'There are no items to display.',
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('space-y-4', className)}>
      {onSearchChange ? (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onSearchChange(e.target.value)
            }
            placeholder={searchPlaceholder}
            className="pl-9 h-9 text-sm"
          />
        </div>
      ) : null}

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={8} cols={columns.length} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={emptyStateIcon}
            title={emptyStateTitle}
            description={emptyStateDescription}
            className="py-12"
          />
        ) : (
          <div className="overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      className={cn(
                        'h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground',
                        col.className
                      )}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-0"
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={cn(
                          'px-4 py-3 align-middle text-sm',
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(row)
                          : (row[col.key] as ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
