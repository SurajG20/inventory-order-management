import client from './client'

export const customerApi = {
  getAll: () => client.get('/customers'),
  getById: (id) => client.get(`/customers/${id}`),
  create: (data) => client.post('/customers', data),
  delete: (id) => client.delete(`/customers/${id}`),
}
