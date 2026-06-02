import client from './client'
import type { Order, OrderCreate } from '@/types'

export const orderApi = {
  getAll: async () => {
    const { data } = await client.get<Order[]>('/orders')
    return data
  },
  getById: async (id: number) => {
    const { data } = await client.get<Order>(`/orders/${id}`)
    return data
  },
  create: async (order: OrderCreate) => {
    const { data } = await client.post<Order>('/orders', order)
    return data
  },
  delete: async (id: number) => {
    await client.delete(`/orders/${id}`)
  },
  updateStatus: async (id: number, status: string) => {
    const { data } = await client.patch<Order>(`/orders/${id}/status`, { status })
    return data
  },
}
