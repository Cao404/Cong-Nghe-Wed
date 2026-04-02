import { useState } from 'react'
import Header from './Header'

function Reports() {
  const [searchTerm, setSearchTerm] = useState('')

  const stats = [
    { label: 'Doanh Thu Tháng', value: '₫125.5M', change: '+12.5%', icon: '💰', color: '#10b981' },
    { label: 'Đơn Hàng', value: '1,234', change: '+8.2%', icon: '📦', color: '#3b82f6' },
    { label: 'Khách Hàng Mới', value: '456', change: '+15.3%', icon: '👥', color: '#8b5cf6' },
    { label: 'Tỷ Lệ Chuyển Đổi', value: '3.2%', change: '+0.5%', icon: '📈', color: '#f59e0b' },
  ]

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 89, revenue: 2670000000 },
    { name: 'Samsung Galaxy S24', sales: 67, revenue: 1474000000 },
    { name: 'AirPods Pro', sales: 123, revenue: 738000000 },
    { name: 'MacBook Pro M3', sales: 34, revenue: 1530000000 },
    { name: 'iPad Pro', sales: 56, revenue: 1568000000 },
  ]

  const topSellers = [
    { name: 'Shop Tech Pro', orders: 234, revenue: 5850000000, rating: 4.8 },
    { name: 'Shop Mobile', orders: 189, revenue: 4725000000, rating: 4.7 },
    { name: 'Shop Laptop', orders: 156, revenue: 7020000000, rating: 4.9 },
    { name: 'Shop Audio', orders: 145, revenue: 2175000000, rating: 4.6 },
    { name: 'Shop Gaming', orders: 123, revenue: 6150000000, rating: 4.8 },
  ]

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header 
        title="BÁO CÁO & GIÁM SÁT"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm báo cáo..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '30px' }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ 
              background: '#1a1f2e', 
              padding: '28px', 
              borderRadius: '12px',
              border: '1px solid #2a2f3e'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px', 
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  {stat.icon}
                </div>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#10b98120',
                  color: '#10b981'
                }}>
                  {stat.change}
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: '#8b92a7' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#1a1f2e', padding: '28px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Sản Phẩm Bán Chạy</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topProducts.map((product, idx) => (
                <div key={idx} style={{ 
                  padding: '16px', 
                  background: '#0f1419', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: 'white', fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>{product.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{product.sales} đã bán</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#10b981', fontSize: '16px', fontWeight: 600 }}>
                      {(product.revenue / 1000000).toFixed(1)}M₫
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#1a1f2e', padding: '28px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Người Bán Hàng Đầu</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topSellers.map((seller, idx) => (
                <div key={idx} style={{ 
                  padding: '16px', 
                  background: '#0f1419', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: 'white', fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>{seller.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>
                      {seller.orders} đơn • ⭐ {seller.rating}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#3b82f6', fontSize: '16px', fontWeight: 600 }}>
                      {(seller.revenue / 1000000).toFixed(1)}M₫
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
