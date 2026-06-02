import { Link } from 'react-router-dom'

export default function LowStockTable({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Low Stock Products</h2>
        <p className="text-gray-500 text-sm">No low stock products.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Low Stock Products (five or fewer)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-600">Product</th>
              <th className="px-4 py-2 font-medium text-gray-600">SKU</th>
              <th className="px-4 py-2 font-medium text-gray-600">Price</th>
              <th className="px-4 py-2 font-medium text-gray-600">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-2 text-gray-600">{p.sku}</td>
                <td className="px-4 py-2 text-gray-600">${parseFloat(p.price).toFixed(2)}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.quantity_in_stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.quantity_in_stock}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
