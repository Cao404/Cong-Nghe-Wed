import { create } from 'zustand'
import type { Customer, Order, Product } from '../types'
import { DEFAULT_PRODUCTS } from '../defaultProducts'

const STORAGE_KEYS = {
  user: 'shop-current-user',
  token: 'shop-auth-token',
} as const

const loadStoredUser = () => {
  const storedUser = localStorage.getItem(STORAGE_KEYS.user)
  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as { id: number; email: string; name: string; role: 'admin' | 'user' }
  } catch {
    localStorage.removeItem(STORAGE_KEYS.user)
    return null
  }
}

const loadStoredToken = () => localStorage.getItem(STORAGE_KEYS.token)

interface ProductWithImage extends Product {
  image: string
  sku: string
  sold: number
  description?: string
}

interface Category {
  id: number
  name: string
  description: string
  productCount: number
  parentCategory: string
  status: 'active' | 'inactive'
}

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Laptop',
    description: 'Máy tính xách tay',
    productCount: 6,
    parentCategory: 'Điện tử',
    status: 'active',
  },
  {
    id: 2,
    name: 'Điện thoại',
    description: 'Điện thoại thông minh',
    productCount: 6,
    parentCategory: 'Điện tử',
    status: 'active',
  },
  {
    id: 3,
    name: 'Máy tính bảng',
    description: 'Tablet các loại',
    productCount: 5,
    parentCategory: 'Điện tử',
    status: 'active',
  },
  {
    id: 4,
    name: 'Phụ kiện',
    description: 'Phụ kiện điện tử',
    productCount: 7,
    parentCategory: 'Điện tử',
    status: 'active',
  },
]

interface PendingOrder {
  id: number
  orderCode: string
  customerName: string
  customerEmail: string
  items: Array<{ productId: number; productName: string; quantity: number; price: number; image: string }>
  total: number
  timestamp: Date | string
  status: 'pending' | 'approved' | 'shipping' | 'delivered' | 'rejected' | 'cancelled'
}

interface AuthUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'user'
}

interface StoreState {
  products: ProductWithImage[]
  orders: Order[]
  customers: Customer[]
  categories: Category[]
  currentUser: AuthUser | null
  authToken: string | null
  currentPage: 'dashboard' | 'products' | 'orders' | 'customers' | 'category' | 'users' | 'user-mgmt' | 'audit' | 'promo' | 'shipping' | 'warranty' | 'reports' | 'rights' | 'inventory'
  pendingOrders: PendingOrder[]
  setCurrentPage: (page: 'dashboard' | 'products' | 'orders' | 'customers' | 'category' | 'users' | 'user-mgmt' | 'audit' | 'promo' | 'shipping' | 'warranty' | 'reports' | 'rights' | 'inventory') => void
  setCurrentUser: (user: AuthUser | null, token?: string | null) => void
  setProducts: (products: ProductWithImage[]) => void
  addProduct: (product: ProductWithImage) => void
  updateProduct: (id: number, product: Partial<ProductWithImage>) => void
  deleteProduct: (id: number) => void
  addCategory: (category: Category) => void
  updateCategory: (id: number, category: Partial<Category>) => void
  deleteCategory: (id: number) => void
  setCategories: (categories: Category[]) => void
  setPendingOrders: (orders: PendingOrder[]) => void
  addPendingOrder: (order: PendingOrder) => void
  approveOrder: (id: number) => void
  updateOrderStatus: (id: number, status: PendingOrder['status']) => void
  rejectOrder: (id: number) => void
  cancelOrder: (id: number) => void
}

const clearAppData = {
  products: [] as ProductWithImage[],
  orders: [] as Order[],
  customers: [] as Customer[],
  categories: [] as Category[],
  pendingOrders: [] as PendingOrder[],
}

export const useStore = create<StoreState>((set) => ({
  currentPage: 'dashboard',
  currentUser: loadStoredUser(),
  authToken: loadStoredToken(),
  products: DEFAULT_PRODUCTS,
  orders: [],
  customers: [],
  categories: DEFAULT_CATEGORIES,
  pendingOrders: [],

  setCurrentPage: (page) => set({ currentPage: page }),

  setCurrentUser: (user, token = null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
      if (token) {
        localStorage.setItem(STORAGE_KEYS.token, token)
      }
      set({ currentUser: user, authToken: token ?? loadStoredToken() })
      return
    }

    localStorage.removeItem(STORAGE_KEYS.user)
    localStorage.removeItem(STORAGE_KEYS.token)
    set({
      currentUser: null,
      authToken: null,
      ...clearAppData,
    })
  },

  setProducts: (products) => set({ products }),

  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),

  updateProduct: (id, updatedProduct) =>
    set((state) => ({
      products: state.products.map((product) => (product.id === id ? { ...product, ...updatedProduct } : product)),
    })),

  deleteProduct: (id) => set((state) => ({ products: state.products.filter((product) => product.id !== id) })),

  addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),

  updateCategory: (id, updatedCategory) =>
    set((state) => ({
      categories: state.categories.map((category) => (category.id === id ? { ...category, ...updatedCategory } : category)),
    })),

  deleteCategory: (id) => set((state) => ({ categories: state.categories.filter((category) => category.id !== id) })),

  setCategories: (categories) => set({ categories }),

  setPendingOrders: (orders) => set({ pendingOrders: orders }),

  addPendingOrder: (order) => set((state) => ({ pendingOrders: [order, ...state.pendingOrders] })),

  approveOrder: (id) =>
    set((state) => ({
      pendingOrders: state.pendingOrders.map((order) => (order.id === id ? { ...order, status: 'approved' as const } : order)),
    })),

  updateOrderStatus: (id, status) =>
    set((state) => ({
      pendingOrders: state.pendingOrders.map((order) => (order.id === id ? { ...order, status } : order)),
    })),

  rejectOrder: (id) =>
    set((state) => ({
      pendingOrders: state.pendingOrders.map((order) => (order.id === id ? { ...order, status: 'rejected' as const } : order)),
    })),

  cancelOrder: (id) =>
    set((state) => ({
      pendingOrders: state.pendingOrders.map((order) => (order.id === id ? { ...order, status: 'cancelled' as const } : order)),
    })),
}))
