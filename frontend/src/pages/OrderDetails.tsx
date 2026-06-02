import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, AlertTriangle } from 'lucide-react'
import { useOrder } from '@/hooks/useOrders'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { SkeletonCard, SkeletonTable } from '@/components/shared/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STATUS_VARIANT: Record<OrderStatus, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  pending: 'warning',
  processing: 'secondary',
  completed: 'success',
  cancelled: 'destructive',
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const orderId = Number(id)
  const { data: order, isLoading, isError, error } = useOrder(orderId)

  if (isError) {
    const is404 = error?.message?.includes('404') || error?.message?.includes('not found')
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <EmptyState
          icon={is404 ? ShoppingCart : AlertTriangle}
          title={is404 ? 'Order not found' : 'Failed to load order'}
          description={
            is404
              ? 'The order you are looking for does not exist or has been removed.'
              : 'Something went wrong. Please try again.'
          }
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <SkeletonTable rows={4} cols={4} />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <EmptyState
          icon={ShoppingCart}
          title="Order not found"
          description="The order you are looking for does not exist or has been removed."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-2 -ml-2"
        onClick={() => navigate('/orders')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle>Order #{order.id}</CardTitle>
            <CardDescription>
              Placed on {formatDateTime(order.created_at)}
            </CardDescription>
          </div>
          <Badge variant={STATUS_VARIANT[order.status]} className="text-sm px-3 py-1">
            {STATUS_LABEL[order.status]}
          </Badge>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{order.customer_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Customer ID</span>
            <span className="text-sm font-mono text-xs text-muted-foreground">
              #{order.customer_id}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.quantity}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-4">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-lg font-semibold">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Order Created</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(order.created_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
