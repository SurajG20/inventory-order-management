import { type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: ElementType
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  children?: ReactNode
}

function EmptyStateIcon({ icon: Icon }: { icon: ElementType }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
      <Icon className="h-6 w-6 text-muted-foreground/70" />
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
    >
      {icon ? <EmptyStateIcon icon={icon} /> : null}
      <div className="mt-4 space-y-1.5">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  )
}
