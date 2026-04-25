import { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import { api, type ApiOrder } from './api'
import Dashboard from './components/tong-quan'
import Products from './components/Products'
import Orders from './components/don-hang'
import Customers from './components/Customers'
import Category from './components/Category'
import UserManagement from './components/UserManagement'
import Promo from './components/Promo'
import Warranty from './components/Warranty'
import Reports from './components/bao-cao'
import Rights from './components/Rights'
import Inventory from './components/Inventory'
import Shipping from './components/Shipping'
import Login from './components/Login'
import Shop from './components/Shop'
import OrderApproval from './components/duyet-don'

function App() {
  const { currentPage, setCurrentPage, currentUser, authToken, setCurrentUser, pendingOrders, setProducts, setCategories, setPendingOrders } = useStore()
  const [showOrderList, setShowOrderList] = useState(false)

  const pendingCount = pendingOrders.filter(o => o.status === 'pending').length

  useEffect(() => {
    let cancelled = false
    let retryHandle: ReturnType<typeof setTimeout> | null = null

    const loadAppData = async () => {
      if (!currentUser) {
        return
      }

      try {
        let shouldRetry = false

        const [productsResult, categoriesResult] = await Promise.allSettled([
          api.getProducts(),
          api.getCategories(),
        ])

        if (cancelled) {
          return
        }

        if (productsResult.status === 'fulfilled') {
          setProducts(
            productsResult.value.map((product) => ({
              ...product,
              sold: product.sold ?? 0,
              description: product.description ?? '',
            })),
          )
        } else {
          console.error('Failed to load products:', productsResult.reason)
          shouldRetry = true
        }

        if (categoriesResult.status === 'fulfilled' && categoriesResult.value.length > 0) {
          setCategories(
            categoriesResult.value.map((category) => ({
              id: category.id,
              name: category.name,
              description: category.description ?? '',
              productCount: category.productCount ?? 0,
              parentCategory: category.parentCategory ?? '',
              status: category.status ?? 'active',
            })),
          )
        } else if (categoriesResult.status === 'rejected') {
          console.error('Failed to load categories:', categoriesResult.reason)
          shouldRetry = true
        }

        if (authToken) {
          const ordersResult = await api.getOrders().then(
            (orders) => ({ status: 'fulfilled' as const, value: orders }),
            (reason) => ({ status: 'rejected' as const, reason }),
          )

          if (cancelled) {
            return
          }

          if (ordersResult.status === 'fulfilled') {
            setPendingOrders(ordersResult.value.map(mapOrder))
          } else {
            console.error('Failed to load orders:', ordersResult.reason)
            shouldRetry = true
          }
        } else {
          setPendingOrders([])
        }

        if (!cancelled && shouldRetry) {
          retryHandle = setTimeout(() => {
            void loadAppData()
          }, 3000)
        }
      } catch (error) {
        console.error('Failed to load app data:', error)
        if (!cancelled) {
          retryHandle = setTimeout(() => {
            void loadAppData()
          }, 3000)
        }
      }
    }

    void loadAppData()

    return () => {
      cancelled = true
      if (retryHandle) {
        clearTimeout(retryHandle)
      }
    }
  }, [authToken, currentUser, setCategories, setPendingOrders, setProducts])

  useEffect(() => {
    const handleAuthInvalid = () => {
      setCurrentUser(null)
    }

    window.addEventListener('shop:auth-invalid', handleAuthInvalid)
    return () => window.removeEventListener('shop:auth-invalid', handleAuthInvalid)
  }, [setCurrentUser])

  function mapOrder(order: ApiOrder) {
    return {
      id: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items.map((item) => ({
        productId: item.productId ?? item.id ?? 0,
        productName: item.productName ?? item.name ?? 'Sản phẩm',
        quantity: item.quantity,
        price: item.price,
        image: item.image ?? '',
      })),
      total: order.total,
      timestamp: order.createdAt ?? new Date().toISOString(),
      status: order.status,
    }
  }

  // Nếu chưa đăng nhập, hiển thị trang Login
  if (!currentUser) {
    return <Login />
  }

  // Nếu là user thường, hiển thị trang Shop
  if (currentUser.role === 'user') {
    return <Shop />
  }

  // Nếu là admin, hiển thị trang quản trị

  const menuItems = [
    { section: 'TỔNG HỢP' },
    { id: 'dashboard', label: 'Bảng điều khiển', icon: '📊' },
    { section: 'SẢN PHẨM' },
    { id: 'products', label: 'Danh sách', icon: '📦' },
    { id: 'orders', label: 'Quản lý đơn hàng', icon: '🧾' },
    { section: 'DANH MỤC' },
    { id: 'category', label: 'Quản lý danh mục', icon: '☰' },
    { section: 'QUẢN TRỊ' },
    { id: 'user-mgmt', label: 'Quản lý người dùng', icon: '👥' },
    { id: 'promo', label: 'Khuyến Mãi', icon: '🎁' },
    { id: 'shipping', label: 'Vận Chuyển', icon: '🚚' },
    { id: 'warranty', label: 'Khiếu Nại & Tranh Chấp', icon: '⚖️' },
    { id: 'reports', label: 'Báo Cáo & Giảm Sát', icon: '📊' },
    { id: 'rights', label: 'Phân Quyền & Nhật Ký', icon: '🔐' },
    { section: 'HÀNG TỒN KHO' },
    { id: 'inventory', label: 'Kho hàng', icon: '📦' },
  ]

  return (
    <>
      {currentUser?.role === 'admin' && <OrderApproval showList={showOrderList} onClose={() => setShowOrderList(false)} />}
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0f1419' }}>
      <nav style={{ width: '280px', background: '#1c2536', color: '#8b92a7', padding: '0', borderRight: '1px solid #2d3748', position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #2d3748' }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: 700 }}>📦 shop.vn</h2>
        </div>
        
        <div style={{ 
          padding: '12px 0', 
          overflowY: 'auto', 
          flex: 1,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        >
          <style>{`
            .sidebar-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {menuItems.map((item, idx) => 
            'section' in item ? (
              <div key={idx} style={{ padding: '18px 24px 10px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginTop: idx > 0 ? '16px' : '0' }}>
                {item.section}
              </div>
            ) : (
              <button
                key={idx}
                onClick={() => setCurrentPage(item.id as any)}
                style={{
                  width: '100%',
                  padding: '13px 24px',
                  background: currentPage === item.id ? '#2d3748' : 'transparent',
                  color: currentPage === item.id ? '#ffffff' : '#9ca3af',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '15px',
                  fontWeight: currentPage === item.id ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.2s',
                  borderLeft: currentPage === item.id ? '3px solid #3b82f6' : '3px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.background = '#232d3f'
                    e.currentTarget.style.color = '#e5e7eb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#9ca3af'
                  }
                }}
              >
                <span style={{ fontSize: '17px', opacity: 0.9 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          )}
          
          <div style={{ 
            margin: '24px 20px', 
            padding: '20px', 
            background: pendingCount > 0 ? '#f97316' : '#2d3748', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            transition: 'background 0.2s',
            position: 'relative'
          }}
          onClick={() => pendingCount > 0 && setShowOrderList(true)}
          onMouseEnter={(e) => e.currentTarget.style.background = pendingCount > 0 ? '#ea580c' : '#374151'}
          onMouseLeave={(e) => e.currentTarget.style.background = pendingCount > 0 ? '#f97316' : '#2d3748'}
          >
            <span style={{ fontSize: '24px' }}>🛒</span>
            <span style={{ color: '#e5e7eb', fontSize: '15px', fontWeight: 500 }}>Đã nhận được đơn đặt hàng</span>
            {pendingCount > 0 && (
              <div style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: 'white',
                color: '#f97316',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                border: '2px solid #1c2536'
              }}>
                {pendingCount}
              </div>
            )}
          </div>
        </div>
        
        <div style={{ 
          padding: '20px 24px', 
          background: '#1c2536',
          borderTop: '1px solid #2d3748'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>{currentUser.name}</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>{currentUser.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</div>
            </div>
            <button 
              onClick={() => setCurrentUser(null)}
              style={{ 
                width: '40px', 
                height: '40px', 
                background: '#2d3748',
                border: 'none',
                borderRadius: '8px',
                color: '#9ca3af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2d3748'}
              title="Đăng xuất"
            >
              ↗
            </button>
          </div>
        </div>
      </nav>
      
      <main style={{ flex: 1, background: '#0f1419', minHeight: '100vh', marginLeft: '280px' }}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'products' && <Products />}
        {currentPage === 'category' && <Category />}
        {currentPage === 'user-mgmt' && <UserManagement />}
        {currentPage === 'promo' && <Promo />}
        {currentPage === 'shipping' && <Shipping />}
        {currentPage === 'warranty' && <Warranty />}
        {currentPage === 'reports' && <Reports />}
        {currentPage === 'rights' && <Rights />}
        {currentPage === 'inventory' && <Inventory />}
        {currentPage === 'orders' && <Orders />}
        {currentPage === 'customers' && <Customers />}
      </main>
    </div>
    </>
  )
}

export default App
