import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'
import { StatsCard } from '@/components/shared/StatsCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { SkeletonCard, SkeletonTable } from '@/components/shared/Skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { RevenueTrend, OrdersTrend, StockDistribution } from '@/components/charts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatCurrency, formatDate, formatNumber, cn } from '@/lib/utils'
import { getStockStatus } from '@/types'
import type { OrderStatus, StockStatus } from '@/types'

const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'success' | 'secondary' | 'destructive'
> = {
  pending: 'default',
  processing: 'secondary',
  completed: 'success',
  cancelled: 'destructive',
}

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STOCK_STATUS_VARIANT: Record<
  StockStatus,
  'success' | 'warning' | 'destructive'
> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'destructive',
}

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboard()

  if (isError) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Overview of your inventory and orders"
        />
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load dashboard"
          description="Something went wrong while fetching your data. Please try again."
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your inventory and orders"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Package}
          title="Total Products"
          value={isLoading ? '—' : formatNumber(data?.total_products ?? 0)}
          subtitle="Active products in inventory"
          isLoading={isLoading}
        />
        <StatsCard
          icon={Users}
          title="Total Customers"
          value={isLoading ? '—' : formatNumber(data?.total_customers ?? 0)}
          subtitle="Registered customers"
          isLoading={isLoading}
        />
        <StatsCard
          icon={ShoppingCart}
          title="Total Orders"
          value={isLoading ? '—' : formatNumber(data?.total_orders ?? 0)}
          subtitle="All-time orders"
          isLoading={isLoading}
        />
        <StatsCard
          icon={DollarSign}
          title="Inventory Value"
          value={isLoading ? '—' : formatCurrency(data?.inventory_value ?? 0)}
          subtitle="Current stock valuation"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersTrend
              data={data?.monthly_orders ?? []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueTrend
              data={data?.monthly_revenue ?? []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Stock Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StockDistribution
              data={data?.stock_distribution ?? []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <SkeletonTable rows={5} cols={3} />
            ) : !data?.low_stock_products?.length ? (
              <EmptyState
                icon={Package}
                title="No low stock products"
                description="All products have sufficient inventory."
                className="py-12"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.low_stock_products.map((product) => {
                    const status = getStockStatus(product.quantity_in_stock)
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {product.sku}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STOCK_STATUS_VARIANT[status]}>
                            {product.quantity_in_stock} in stock
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : !data?.recent_orders?.length ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Orders will appear here once customers start placing them."
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recent_orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/orders/${order.id}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        #{order.id}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.items.length}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.total_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
