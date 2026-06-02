import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react'
import { useOrders, useDeleteOrder } from '@/hooks/useOrders'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

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

export default function Orders() {
  const { data: orders, isLoading, isError } = useOrders()
  const deleteOrder = useDeleteOrder()

  const [search, setSearch] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteOrder.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      })
    }
  }

  const columns: Column<Order>[] = [
    {
      key: 'id' as keyof Order,
      header: 'Order ID',
      render: (row) => (
        <span className="font-mono text-xs font-medium">#{row.id}</span>
      ),
    },
    {
      key: 'customer_name' as keyof Order,
      header: 'Customer',
      render: (row) => <span className="font-medium">{row.customer_name}</span>,
    },
    {
      key: 'items' as keyof Order,
      header: 'Items',
      render: (row) => (
        <span className="text-muted-foreground">{row.items.length}</span>
      ),
    },
    {
      key: 'total_amount' as keyof Order,
      header: 'Total',
      render: (row) => (
        <span className="font-medium">{formatCurrency(row.total_amount)}</span>
      ),
    },
    {
      key: 'created_at' as keyof Order,
      header: 'Date',
      render: (row) => (
        <span className="text-muted-foreground">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'status' as keyof Order,
      header: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]}>
          {STATUS_LABEL[row.status]}
        </Badge>
      ),
    },
    {
      key: 'id' as keyof Order,
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toggleRow(row.id)}
          >
            {expandedRows.has(row.id) ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Expand</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-8">
        <PageHeader title="Orders" description="Track and manage customer orders" />
        <EmptyState
          icon={ShoppingCart}
          title="Failed to load orders"
          description="Something went wrong. Please try again."
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Orders" description="Track and manage customer orders">
        <Button size="sm" asChild>
          <Link to="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Link>
        </Button>
      </PageHeader>

      <div className="space-y-4">
        <div className="relative max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="w-full p-0">
              <div className="border-b">
                <div className="flex h-12 items-center gap-4 px-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-md bg-muted h-3"
                      style={{ width: i === 0 ? '30%' : '6rem' }}
                    />
                  ))}
                </div>
              </div>
              {Array.from({ length: 8 }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex items-center gap-4 px-4 py-3.5 border-b border-border/50">
                  {Array.from({ length: 7 }).map((_, colIdx) => (
                    <div
                      key={colIdx}
                      className="animate-pulse rounded-md bg-muted h-3.5"
                      style={{ width: colIdx === 0 ? '30%' : '5rem' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title={search ? 'No orders found' : 'No orders yet'}
              description={
                search
                  ? 'No orders match your search.'
                  : 'Orders will appear here once customers start placing them.'
              }
              className="py-12"
            />
          ) : (
            <div className="overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Order ID
                    </th>
                    <th className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Items
                    </th>
                    <th className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(search
                    ? orders.filter(
                        (o) =>
                          o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                          String(o.id).includes(search)
                      )
                    : orders
                  ).map((order) => (
                    <tr key={order.id} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3 align-middle text-sm">
                        <span className="font-mono text-xs font-medium">#{order.id}</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm">
                        <span className="font-medium">{order.customer_name}</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm">
                        <span className="text-muted-foreground">{order.items.length}</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm">
                        <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm">
                        <span className="text-muted-foreground">{formatDate(order.created_at)}</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm">
                        <Badge variant={STATUS_VARIANT[order.status]}>
                          {STATUS_LABEL[order.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleRow(order.id)}
                          >
                            {expandedRows.has(order.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="sr-only">Expand</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(order)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {orders &&
          orders.filter(
            (o) =>
              o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
              String(o.id).includes(search)
          ).map((order) =>
            expandedRows.has(order.id) ? (
              <Card key={`expanded-${order.id}`} className="overflow-hidden transition-all duration-200">
                <CardContent className="p-0">
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground">
                      Order #{order.id} — Items
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.quantity} x {formatCurrency(item.unit_price)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatCurrency(item.unit_price)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : null
          )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Cancel Order"
        description={
          deleteTarget
            ? `Are you sure you want to cancel order #${deleteTarget.id}? This action cannot be undone.`
            : ''
        }
        confirmLabel={deleteOrder.isPending ? 'Cancelling...' : 'Cancel Order'}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}
