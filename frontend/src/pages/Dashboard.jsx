import { useState, useEffect } from 'react'
import { dashboardApi } from '../api/dashboard'
import StatsCard from '../components/StatsCard'
import LowStockTable from '../components/LowStockTable'
import LoadingSpinner from '../components/LoadingSpinner'

const iconPaths = {
  box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  shopping: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z',
  alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.get().then((res) => setData(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Products" value={data.total_products} icon={iconPaths.box} color="indigo" />
        <StatsCard title="Total Customers" value={data.total_customers} icon={iconPaths.users} color="green" />
        <StatsCard title="Total Orders" value={data.total_orders} icon={iconPaths.shopping} color="blue" />
        <StatsCard title="Low Stock Items" value={data.low_stock_products.length} icon={iconPaths.alert} color="orange" />
      </div>
      <LowStockTable products={data.low_stock_products} />
    </div>
  )
}
