import client from './client'
import type { Product, ProductCreate, ProductUpdate, PaginatedResponse } from '@/types'

export const productApi = {
  getAll: async (params?: { search?: string; page?: number; page_size?: number }) => {
    const { data } = await client.get<Product[]>('/products', { params })
    return data
  },
  getById: async (id: number) => {
    const { data } = await client.get<Product>(`/products/${id}`)
    return data
  },
  create: async (product: ProductCreate) => {
    const { data } = await client.post<Product>('/products', product)
    return data
  },
  update: async (id: number, product: ProductUpdate) => {
    const { data } = await client.put<Product>(`/products/${id}`, product)
    return data
  },
  delete: async (id: number) => {
    await client.delete(`/products/${id}`)
  },
}
