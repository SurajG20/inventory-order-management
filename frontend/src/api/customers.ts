import client from './client'
import type { Customer, CustomerCreate } from '@/types'

export const customerApi = {
  getAll: async () => {
    const { data } = await client.get<Customer[]>('/customers')
    return data
  },
  getById: async (id: number) => {
    const { data } = await client.get<Customer>(`/customers/${id}`)
    return data
  },
  create: async (customer: CustomerCreate) => {
    const { data } = await client.post<Customer>('/customers', customer)
    return data
  },
  delete: async (id: number) => {
    await client.delete(`/customers/${id}`)
  },
}
