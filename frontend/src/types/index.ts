export interface Product {
  id: number
  name: string
  sku: string
  price: number
  quantity_in_stock: number
  created_at: string
  updated_at: string | null
}

export interface ProductCreate {
  name: string
  sku: string
  price: number
  quantity_in_stock: number
}

export type ProductUpdate = Partial<ProductCreate>

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export function getStockStatus(quantity: number): StockStatus {
  if (quantity === 0) return 'out_of_stock'
  if (quantity <= 5) return 'low_stock'
  return 'in_stock'
}

export interface Customer {
  id: number
  full_name: string
  email: string
  phone: string | null
  created_at: string
  total_orders?: number
}

export interface CustomerCreate {
  full_name: string
  email: string
  phone?: string | null
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: number
  customer_id: number
  customer_name: string
  total_amount: number
  status: OrderStatus
  items: OrderItem[]
  created_at: string
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface OrderCreate {
  customer_id: number
  items: { product_id: number; quantity: number }[]
}

export interface DashboardData {
  total_products: number
  total_customers: number
  total_orders: number
  total_revenue: number
  inventory_value: number
  low_stock_products: Product[]
  recent_orders: Order[]
  monthly_orders: { month: string; orders: number }[]
  monthly_revenue: { month: string; revenue: number }[]
  stock_distribution: { status: string; count: number }[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
