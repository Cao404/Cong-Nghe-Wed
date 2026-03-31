import { create } from 'zustand'
import type { Product, Order, Customer } from '../types'

interface ProductWithImage extends Product {
  image: string
  sku: string
  sold: number
}

interface Category {
  id: number
  name: string
  description: string
  productCount: number
  parentCategory: string
  status: 'active' | 'inactive'
}

interface StoreState {
  products: ProductWithImage[]
  orders: Order[]
  customers: Customer[]
  categories: Category[]
  currentPage: 'dashboard' | 'products' | 'orders' | 'customers' | 'category' | 'users' | 'user-mgmt' | 'audit' | 'promo' | 'shipping' | 'warranty' | 'reports' | 'rights' | 'inventory'
  setCurrentPage: (page: 'dashboard' | 'products' | 'orders' | 'customers' | 'category' | 'users' | 'user-mgmt' | 'audit' | 'promo' | 'shipping' | 'warranty' | 'reports' | 'rights' | 'inventory') => void
  addProduct: (product: ProductWithImage) => void
  updateProduct: (id: number, product: Partial<ProductWithImage>) => void
  deleteProduct: (id: number) => void
  addCategory: (category: Category) => void
  updateCategory: (id: number, category: Partial<Category>) => void
  deleteCategory: (id: number) => void
  setCategories: (categories: Category[]) => void
}

export const useStore = create<StoreState>((set) => ({
  currentPage: 'dashboard',
  
  products: [
    { 
      id: 1, 
      name: 'Laptop Dell XPS 13', 
      price: 25000000, 
      stock: 15, 
      category: 'Laptop',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=150&h=150&fit=crop',
      sku: 'SKU-0001',
      sold: 45
    },
    { 
      id: 2, 
      name: 'iPhone 15 Pro', 
      price: 30000000, 
      stock: 8, 
      category: 'Điện thoại',
      image: 'https://images.unsplash.com/photo-1592286927505-4a9d1b4b0b8d?w=150&h=150&fit=crop',
      sku: 'SKU-0002',
      sold: 89
    },
    { 
      id: 3, 
      name: 'Samsung Galaxy S24', 
      price: 22000000, 
      stock: 12, 
      category: 'Điện thoại',
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=150&h=150&fit=crop',
      sku: 'SKU-0003',
      sold: 67
    },
    { 
      id: 4, 
      name: 'MacBook Pro M3', 
      price: 45000000, 
      stock: 5, 
      category: 'Laptop',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=150&h=150&fit=crop',
      sku: 'SKU-0004',
      sold: 34
    },
    { 
      id: 5, 
      name: 'iPad Pro', 
      price: 28000000, 
      stock: 10, 
      category: 'Máy tính bảng',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=150&h=150&fit=crop',
      sku: 'SKU-0005',
      sold: 56
    },
    { 
      id: 6, 
      name: 'AirPods Pro', 
      price: 6000000, 
      stock: 25, 
      category: 'Phụ kiện',
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=150&h=150&fit=crop',
      sku: 'SKU-0006',
      sold: 123
    }
  ],

  categories: [
    { id: 1, name: 'Điện thoại', description: 'Điện thoại thông minh', productCount: 45, parentCategory: 'Điện tử', status: 'active' },
    { id: 2, name: 'Laptop', description: 'Máy tính xách tay', productCount: 32, parentCategory: 'Điện tử', status: 'active' },
    { id: 3, name: 'Máy tính bảng', description: 'Tablet các loại', productCount: 18, parentCategory: 'Điện tử', status: 'active' },
    { id: 4, name: 'Phụ kiện', description: 'Phụ kiện điện tử', productCount: 67, parentCategory: 'Điện tử', status: 'active' },
    { id: 5, name: 'Tai nghe', description: 'Tai nghe và loa', productCount: 28, parentCategory: 'Phụ kiện', status: 'active' },
    { id: 6, name: 'Sạc dự phòng', description: 'Pin sạc dự phòng', productCount: 15, parentCategory: 'Phụ kiện', status: 'active' },
  ],

  orders: [
    { id: 1, customerName: 'Nguyễn Văn A', total: 25000000, status: 
'completed', date: '2024-03-15' },
    { id: 2, customerName: 'Trần Thị B', total: 30000000, status: 'processing', date: '2024-03-20' },
    { id: 3, customerName: 'Lê Văn C', total: 22000000, status: 'pending', date: '2024-03-25' },
    { id: 4, customerName: 'Phạm Thị D', total: 45000000, status: 'completed', date: '2024-03-28' }
  ],

  customers: [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', totalOrders: 5 },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0912345678', totalOrders: 3 },
    { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', phone: '0923456789', totalOrders: 8 },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', phone: '0934567890', totalOrders: 2 }
  ],

  setCurrentPage: (page) => set({ currentPage: page }),
  
  addProduct: (product) => set((state) => ({ 
    products: [...state.products, product] 
  })),
  
  updateProduct: (id, updatedProduct) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updatedProduct } : p)
  })),
  
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),

  addCategory: (category) => set((state) => ({ 
    categories: [...state.categories, category] 
  })),
  
  updateCategory: (id, updatedCategory) => set((state) => ({
    categories: state.categories.map(c => c.id === id ? { ...c, ...updatedCategory } : c)
  })),
  
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  })),

  setCategories: (categories) => set({ categories })
}))
