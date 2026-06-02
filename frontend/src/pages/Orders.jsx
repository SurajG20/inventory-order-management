import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { orderApi } from '../api/orders'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  const fetchOrders = useCallback(() => {
    orderApi.getAll().then((res) => setOrders(res.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleDelete = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return
    await orderApi.delete(id)
    fetchOrders()
  }

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <Link
          to="/orders/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Create Order
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">Order ID</th>
                <th className="px-6 py-3 font-medium text-gray-600">Customer</th>
                <th className="px-6 py-3 font-medium text-gray-600">Items</th>
                <th className="px-6 py-3 font-medium text-gray-600">Total</th>
                <th className="px-6 py-3 font-medium text-gray-600">Date</th>
                <th className="px-6 py-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <>
                  <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(o.id)}>
                    <td className="px-6 py-4 font-medium text-gray-900">#{o.id}</td>
                    <td className="px-6 py-4 text-gray-600">{o.customer_name}</td>
                    <td className="px-6 py-4 text-gray-600">{o.items?.length || 0}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${parseFloat(o.total_amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(o.id) }}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                  {expandedId === o.id && (
                    <tr key={`${o.id}-items`}>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items:</h4>
                        <div className="space-y-1">
                          {o.items?.map((item, idx) => (
                            <div key={idx} className="text-xs text-gray-600 flex justify-between max-w-md">
                              <span>{item.product_name}</span>
                              <span>{item.quantity} x ${parseFloat(item.unit_price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
