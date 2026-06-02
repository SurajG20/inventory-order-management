import { useState, useEffect, useCallback } from 'react'
import { productApi } from '../api/products'
import ProductForm from '../components/ProductForm'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState('')

  const fetchProducts = useCallback(() => {
    productApi.getAll().then((res) => setProducts(res.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSave = async (data) => {
    setError('')
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, data)
      } else {
        await productApi.create(data)
      }
      setShowForm(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await productApi.delete(id)
    fetchProducts()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={() => { setEditingProduct(null); setError(''); setShowForm(true) }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-600">Name</th>
                <th className="px-6 py-3 font-medium text-gray-600">SKU</th>
                <th className="px-6 py-3 font-medium text-gray-600">Price</th>
                <th className="px-6 py-3 font-medium text-gray-600">Stock</th>
                <th className="px-6 py-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600">{p.sku}</td>
                  <td className="px-6 py-4 text-gray-600">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.quantity_in_stock === 0 ? 'bg-red-100 text-red-700' :
                      p.quantity_in_stock <= 5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {p.quantity_in_stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => { setEditingProduct(p); setError(''); setShowForm(true) }}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No products yet. Click "+ Add Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingProduct(null); setError('') }}
          error={error}
        />
      )}
    </div>
  )
}
