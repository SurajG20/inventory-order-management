import client from './client'
import type { DashboardData } from '@/types'

export const dashboardApi = {
  get: async () => {
    const { data } = await client.get<DashboardData>('/dashboard')
    return data
  },
}
