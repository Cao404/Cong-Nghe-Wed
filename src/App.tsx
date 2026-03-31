import { useStore } from './store/useStore'
import Dashboard from './components/Dashboard'
import Products from './components/Products'
import Orders from './components/Orders'
import Customers from './components/Customers'
import Category from './components/Category'
import UserManagement from './components/UserManagement'
import Promo from './components/Promo'
import Warranty from './components/Warranty'
import Reports from './components/Reports'
import Rights from './components/Rights'
import Inventory from './components/Inventory'
import Shipping from './components/Shipping'

function App() {
  const { currentPage, setCurrentPage } = useStore()

  const menuItems = [
    { section: 'TỔNG HỢP' },
    { id: 'dashboard', label: 'Bảng điều khiển', icon: '📊' },
    { section: 'SẢN PHẨM' },
    { id: 'products', label: 'Danh sách', icon: '📦' },
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
        className="sidebar-scroll"
        >
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
            background: '#2d3748', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2d3748'}
          >
            <span style={{ fontSize: '24px' }}>🛒</span>
            <span style={{ color: '#e5e7eb', fontSize: '15px', fontWeight: 500 }}>Đã nhận được đơn đặt hàng</span>
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
              <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>Admin</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>Quản trị viên</div>
            </div>
            <button style={{ 
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
  )
}

export default App
