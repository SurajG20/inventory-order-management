import { useState, useEffect, useCallback } from 'react'
import { customerApi } from '../api/customers'
import CustomerForm from '../components/CustomerForm'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const fetchCustomers = useCallback(() => {
    customerApi.getAll().then((res) => setCustomers(res.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const handleSave = async (data) => {
    setError('')
    try {
      await customerApi.create(data)
      setShowForm(false)
      fetchCustomers()
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    await customerApi.delete(id)
    fetchCustomers()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <button
          onClick={() => { setError(''); setShowForm(true) }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          + Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">Name</th>
                <th className="px-6 py-3 font-medium text-gray-600">Email</th>
                <th className="px-6 py-3 font-medium text-gray-600">Phone</th>
                <th className="px-6 py-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{c.email}</td>
                  <td className="px-6 py-4 text-gray-600">{c.phone || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <CustomerForm
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setError('') }}
          error={error}
        />
      )}
    </div>
  )
}
