import { useState, useMemo, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/useProducts'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getStockStatus } from '@/types'
import type { Product, ProductCreate, StockStatus } from '@/types'

const STOCK_VARIANT: Record<StockStatus, 'success' | 'warning' | 'destructive'> = {
  in_stock: 'success',
  low_stock: 'warning',
  out_of_stock: 'destructive',
}

const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
}

const EMPTY_FORM: ProductCreate = {
  name: '',
  sku: '',
  price: 0,
  quantity_in_stock: 0,
}

export default function Products() {
  const { data: products, isLoading, isError } = useProducts()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductCreate>(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const isEditing = editingProduct !== null
  const isSubmitting = createProduct.isPending || updateProduct.isPending

  const filtered = useMemo(() => {
    if (!products) return []
    const q = search.toLowerCase()
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    )
  }, [products, search])

  const openAdd = () => {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity_in_stock: product.quantity_in_stock,
    })
    setDialogOpen(true)
  }

  const handleClose = () => {
    setDialogOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (isEditing && editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: form },
        { onSuccess: () => handleClose() },
      )
    } else {
      createProduct.mutate(form, { onSuccess: () => handleClose() })
    }
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProduct.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      })
    }
  }

  const columns: Column<Product>[] = [
    {
      key: 'name' as keyof Product,
      header: 'Product Name',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'sku' as keyof Product,
      header: 'SKU',
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">{row.sku}</span>
      ),
    },
    {
      key: 'price' as keyof Product,
      header: 'Price',
      render: (row) => formatCurrency(row.price),
    },
    {
      key: 'quantity_in_stock' as keyof Product,
      header: 'Stock',
      render: (row) => {
        const status = getStockStatus(row.quantity_in_stock)
        return <Badge variant={STOCK_VARIANT[status]}>{STOCK_LABEL[status]}</Badge>
      },
    },
    {
      key: 'updated_at' as keyof Product,
      header: 'Last Updated',
      render: (row) => (
        <span className="text-muted-foreground">
          {row.updated_at ? formatDate(row.updated_at) : '\u2014'}
        </span>
      ),
    },
    {
      key: 'id' as keyof Product,
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
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
        <PageHeader title="Products" description="Manage your product inventory" />
        <EmptyState
          icon={Package}
          title="Failed to load products"
          description="Something went wrong. Please try again."
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Products" description="Manage your product inventory">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>

      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={filtered as unknown as Record<string, unknown>[]}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or SKU..."
        isLoading={isLoading}
        emptyStateIcon={Package}
        emptyStateTitle={search ? 'No products found' : 'No products yet'}
        emptyStateDescription={
          search
            ? 'No products match your search. Try a different term.'
            : 'Get started by adding your first product.'
        }
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : handleClose())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="product-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Name
                </label>
                <Input
                  id="product-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Product name"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="product-sku"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  SKU
                </label>
                <Input
                  id="product-sku"
                  required
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  placeholder="SKU-001"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="product-price"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Price
                </label>
                <Input
                  id="product-price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price || ''}
                  onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="product-quantity"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Quantity
                </label>
                <Input
                  id="product-quantity"
                  type="number"
                  required
                  min="0"
                  value={form.quantity_in_stock || ''}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity_in_stock: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete Product"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel={deleteProduct.isPending ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}
