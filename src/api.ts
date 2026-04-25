const DEFAULT_API_BASE_URL = '/api'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')
const TOKEN_KEY = 'shop-auth-token'
const USER_KEY = 'shop-current-user'
const AUTH_INVALID_EVENT = 'shop:auth-invalid'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    if (token && data?.error === 'Invalid or expired token') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.dispatchEvent(new Event(AUTH_INVALID_EVENT))
    }

    throw new Error(data?.error || data?.message || 'Yêu cầu thất bại')
  }

  return data as T
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    email: string
    name: string
    role: 'admin' | 'user'
  }
}

export interface ApiProduct {
  id: number
  name: string
  price: number
  stock: number
  category: string
  image: string
  sku: string
  sold?: number | null
  description?: string | null
}

export interface ApiCategory {
  id: number
  name: string
  description?: string | null
  productCount?: number | null
  parentCategory?: string | null
  status?: 'active' | 'inactive' | null
}

export interface ApiUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'user'
  phone?: string | null
  createdAt?: string | null
  _count?: {
    orders: number
  }
}

export interface ApiOrderItem {
  id?: number
  productId?: number
  name?: string
  productName?: string
  price: number
  quantity: number
  image?: string
}

export interface ApiOrder {
  id: number
  orderCode: string
  customerName: string
  customerEmail: string
  items: ApiOrderItem[]
  total: number
  createdAt?: string | null
  updatedAt?: string | null
  status: 'pending' | 'approved' | 'shipping' | 'delivered' | 'rejected' | 'cancelled'
}

export interface ApiOrderHistoryEntry {
  id: number
  orderId: number
  actorId?: number | null
  actorName: string
  actorRole?: string | null
  action: 'created' | 'approved' | 'rejected' | 'cancelled' | string
  fromStatus?: string | null
  toStatus?: string | null
  note?: string | null
  createdAt: string
}

export interface ApiVoucher {
  id: number
  code: string
  name: string
  type: 'percentage' | 'fixed' | string
  value: number
  minOrder: number
  maxDiscount: number
  quantity: number
  used: number
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'expired' | string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ApiShippingPartner {
  id: number
  name: string
  code: string
  logo: string
  type: 'express' | 'standard' | 'economy' | string
  status: 'active' | 'inactive' | string
  totalOrders: number
  successRate: number
  avgDeliveryTime: number
  fee: number
  contact: string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ApiDispute {
  id: number
  disputeCode: string
  orderCode: string
  customer: string
  shop: string
  type: 'refund' | 'return' | 'complaint' | 'warranty' | string
  reason: string
  amount: number
  status: 'pending' | 'investigating' | 'resolved' | 'rejected' | string
  priority: 'low' | 'medium' | 'high' | string
  createdDate: string
  updatedAt?: string | null
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProducts: () => request<ApiProduct[]>('/products'),

  createProduct: (payload: {
    name: string
    price: number
    stock: number
    category: string
    image?: string
    sku: string
    description?: string
  }) =>
    request<ApiProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProduct: (
    id: number,
    payload: {
      name?: string
      price?: number
      stock?: number
      category?: string
      image?: string
      sku?: string
      description?: string
    },
  ) =>
    request<ApiProduct>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteProduct: (id: number) =>
    request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),

  getCategories: () => request<ApiCategory[]>('/categories'),

  createCategory: (payload: {
    name: string
    description?: string
    parentCategory?: string
  }) =>
    request<ApiCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateCategory: (
    id: number,
    payload: {
      name?: string
      description?: string
      status?: 'active' | 'inactive'
      parentCategory?: string | null
    },
  ) =>
    request<ApiCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteCategory: (id: number) =>
    request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    }),

  getOrders: () => request<ApiOrder[]>('/orders'),

  getOrderHistory: (id: number) => request<ApiOrderHistoryEntry[]>(`/orders/${id}/history`),

  getUsers: () => request<ApiUser[]>('/users'),

  updateUser: (
    id: number,
    payload: {
      name?: string
      phone?: string
      role?: 'user' | 'admin'
    },
  ) =>
    request<ApiUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteUser: (id: number) =>
    request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),

  createOrder: (payload: {
    customerName: string
    customerEmail: string
    customerPhone?: string
    address?: string
    city?: string
    district?: string
    items: ApiOrderItem[]
    total: number
    shippingFee?: number
    paymentMethod?: string
    note?: string
  }) =>
    request<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  approveOrder: (id: number) =>
    request<ApiOrder>(`/orders/${id}/approve`, {
      method: 'PUT',
    }),

  updateOrderStatus: (id: number, status: ApiOrder['status']) =>
    request<ApiOrder>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  rejectOrder: (id: number) =>
    request<ApiOrder>(`/orders/${id}/reject`, {
      method: 'PUT',
    }),

  cancelOrder: (id: number) =>
    request<ApiOrder>(`/orders/${id}/cancel`, {
      method: 'PUT',
    }),

  getVouchers: () => request<ApiVoucher[]>('/vouchers'),

  createVoucher: (payload: {
    code: string
    name: string
    type: 'percentage' | 'fixed'
    value: number
    minOrder: number
    maxDiscount: number
    quantity: number
    startDate: string
    endDate: string
    status?: 'active' | 'inactive' | 'expired'
  }) =>
    request<ApiVoucher>('/vouchers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateVoucher: (
    id: number,
    payload: Partial<{
      code: string
      name: string
      type: 'percentage' | 'fixed'
      value: number
      minOrder: number
      maxDiscount: number
      quantity: number
      startDate: string
      endDate: string
      status: 'active' | 'inactive' | 'expired'
    }>,
  ) =>
    request<ApiVoucher>(`/vouchers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteVoucher: (id: number) =>
    request<{ message: string }>(`/vouchers/${id}`, {
      method: 'DELETE',
    }),

  getShippingPartners: () => request<ApiShippingPartner[]>('/shipping-partners'),

  createShippingPartner: (payload: {
    name: string
    code: string
    logo?: string
    type: 'express' | 'standard' | 'economy'
    fee: number
    avgDeliveryTime: number
    contact: string
    status?: 'active' | 'inactive'
    totalOrders?: number
    successRate?: number
  }) =>
    request<ApiShippingPartner>('/shipping-partners', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateShippingPartner: (
    id: number,
    payload: Partial<{
      name: string
      code: string
      logo: string
      type: 'express' | 'standard' | 'economy'
      fee: number
      avgDeliveryTime: number
      contact: string
      status: 'active' | 'inactive'
      totalOrders: number
      successRate: number
    }>,
  ) =>
    request<ApiShippingPartner>(`/shipping-partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteShippingPartner: (id: number) =>
    request<{ message: string }>(`/shipping-partners/${id}`, {
      method: 'DELETE',
    }),

  getDisputes: () => request<ApiDispute[]>('/disputes'),

  createDispute: (payload: {
    disputeCode: string
    orderCode: string
    customer: string
    shop: string
    type: 'refund' | 'return' | 'complaint' | 'warranty'
    reason: string
    amount: number
    status?: 'pending' | 'investigating' | 'resolved' | 'rejected'
    priority?: 'low' | 'medium' | 'high'
    createdDate?: string
  }) =>
    request<ApiDispute>('/disputes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateDispute: (
    id: number,
    payload: Partial<{
      disputeCode: string
      orderCode: string
      customer: string
      shop: string
      type: 'refund' | 'return' | 'complaint' | 'warranty'
      reason: string
      amount: number
      status: 'pending' | 'investigating' | 'resolved' | 'rejected'
      priority: 'low' | 'medium' | 'high'
      createdDate: string
    }>,
  ) =>
    request<ApiDispute>(`/disputes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updateDisputeStatus: (id: number, status: 'pending' | 'investigating' | 'resolved' | 'rejected') =>
    request<ApiDispute>(`/disputes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  deleteDispute: (id: number) =>
    request<{ message: string }>(`/disputes/${id}`, {
      method: 'DELETE',
    }),
}
