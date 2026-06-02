import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerApi } from '@/api/customers'
import type { CustomerCreate } from '@/types'
import { toast } from 'sonner'

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => customerApi.getAll(),
  })
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomerCreate) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Customer created successfully')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Customer deleted')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
