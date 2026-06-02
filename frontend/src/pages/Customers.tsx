import { useState, useMemo, type FormEvent } from 'react'
import { Plus, Trash2, Search, Users } from 'lucide-react'
import { useCustomers, useCreateCustomer, useDeleteCustomer } from '@/hooks/useCustomers'
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
import { formatDate } from '@/lib/utils'
import type { Customer, CustomerCreate } from '@/types'

const EMPTY_FORM: CustomerCreate = {
  full_name: '',
  email: '',
  phone: '',
}

export default function Customers() {
  const { data: customers, isLoading, isError } = useCustomers()
  const createCustomer = useCreateCustomer()
  const deleteCustomer = useDeleteCustomer()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<CustomerCreate>(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  const filtered = useMemo(() => {
    if (!customers) return []
    const q = search.toLowerCase()
    return customers.filter(
      (c) => c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    )
  }, [customers, search])

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const handleClose = () => {
    setDialogOpen(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createCustomer.mutate(form, { onSuccess: () => handleClose() })
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteCustomer.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      })
    }
  }

  const columns: Column<Customer>[] = [
    {
      key: 'full_name' as keyof Customer,
      header: 'Name',
      render: (row) => <span className="font-medium">{row.full_name}</span>,
    },
    {
      key: 'email' as keyof Customer,
      header: 'Email',
      render: (row) => (
        <span className="text-muted-foreground">{row.email}</span>
      ),
    },
    {
      key: 'phone' as keyof Customer,
      header: 'Phone',
      render: (row) => (
        <span className="text-muted-foreground">{row.phone || '\u2014'}</span>
      ),
    },
    {
      key: 'created_at' as keyof Customer,
      header: 'Joined',
      render: (row) => (
        <span className="text-muted-foreground">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'id' as keyof Customer,
      header: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => setDeleteTarget(row)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-8">
        <PageHeader title="Customers" description="Manage your customer accounts" />
        <EmptyState
          icon={Users}
          title="Failed to load customers"
          description="Something went wrong. Please try again."
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Customers" description="Manage your customer accounts">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </PageHeader>

      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={filtered as unknown as Record<string, unknown>[]}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        isLoading={isLoading}
        emptyStateIcon={Users}
        emptyStateTitle={search ? 'No customers found' : 'No customers yet'}
        emptyStateDescription={
          search
            ? 'No customers match your search. Try a different term.'
            : 'Get started by adding your first customer.'
        }
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : handleClose())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="customer-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Full Name
                </label>
                <Input
                  id="customer-name"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="customer-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <Input
                  id="customer-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="customer-phone"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Phone
                </label>
                <Input
                  id="customer-phone"
                  value={form.phone ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || null }))}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={createCustomer.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCustomer.isPending}>
                {createCustomer.isPending ? 'Adding...' : 'Add Customer'}
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
        title="Delete Customer"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.full_name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel={deleteCustomer.isPending ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}
