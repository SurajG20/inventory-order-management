import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateOrder } from '@/hooks/useOrders'
import { useProducts } from '@/hooks/useProducts'
import { useCustomers } from '@/hooks/useCustomers'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/PageHeader'
import { SkeletonBox as Skeleton } from '@/components/shared/Skeleton'
import { ArrowLeft, Plus, Minus } from 'lucide-react'

interface OrderItemEntry {
  product_id: string
  quantity: string
}

export default function CreateOrder() {
  const navigate = useNavigate()
  const { data: products, isLoading: productsLoading } = useProducts()
  const { data: customers, isLoading: customersLoading } = useCustomers()
  const createOrder = useCreateOrder()

  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<OrderItemEntry[]>([{ product_id: '', quantity: '1' }])
  const [error, setError] = useState('')

  const isLoading = productsLoading || customersLoading

  useEffect(() => {
    setError('')
  }, [customerId, items])

  const addItem = () => setItems([...items, { product_id: '', quantity: '1' }])
  const removeItem = (idx: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx))
  }
  const updateItem = (idx: number, field: keyof OrderItemEntry, value: string) => {
    const updated = [...items]
    updated[idx][field] = value
    setItems(updated)
  }

  const calculateTotal = (): number => {
    if (!products) return 0
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id.toString() === item.product_id)
      if (!product) return sum
      return sum + product.price * parseInt(item.quantity || '0', 10)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!customerId) {
      setError('Please select a customer')
      return
    }

    const orderItems = items.map((item) => ({
      product_id: parseInt(item.product_id, 10),
      quantity: parseInt(item.quantity, 10),
    }))

    const invalid = orderItems.find((i) => !i.product_id || i.quantity < 1)
    if (invalid) {
      setError('Please select a product and valid quantity for all items')
      return
    }

    const duplicate = orderItems.find(
      (item, idx) => orderItems.findIndex((i) => i.product_id === item.product_id) !== idx
    )
    if (duplicate) {
      setError('Duplicate products found. Please combine quantities.')
      return
    }

    createOrder.mutate(
      { customer_id: parseInt(customerId, 10), items: orderItems },
      {
        onSuccess: () => navigate('/orders'),
        onError: (err: Error) => setError(err.message),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Create Order"
        description="Select a customer and add products to the order"
      >
        <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.full_name} ({c.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {customers?.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                No customers yet. Add a customer first.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Order Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-3 w-3" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => {
              const selectedProduct = products?.find(
                (p) => p.id.toString() === item.product_id
              )
              const lineTotal = selectedProduct
                ? selectedProduct.price * parseInt(item.quantity || '0', 10)
                : 0

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
                >
                  <Select
                    value={item.product_id}
                    onValueChange={(v) => updateItem(idx, 'product_id', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id.toString()}
                          disabled={p.quantity_in_stock === 0}
                        >
                          {p.name} ({formatCurrency(p.price)}) - Stock: {p.quantity_in_stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    className="w-24"
                    required
                  />
                  <span className="text-sm text-muted-foreground w-20 text-right tabular-nums">
                    {formatCurrency(lineTotal)}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(idx)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <span className="text-sm font-medium text-muted-foreground">Total</span>
            <span className="text-2xl font-bold tabular-nums">
              {formatCurrency(calculateTotal())}
            </span>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/orders')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  )
}
