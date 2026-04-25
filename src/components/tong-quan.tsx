import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import Header from './Header'

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const products = useStore((state) => state.products)
  const categories = useStore((state) => state.categories)
  const orders = useStore((state) => state.pendingOrders)

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const pendingOrders = orders.filter((order) => order.status === 'pending').length
    const approvedOrders = orders.filter((order) => order.status === 'approved').length
    const topCategory = categories[0]?.name ?? 'Chưa có'

    return [
      { label: 'Tổng doanh thu', value: money(totalRevenue), change: `${orders.length} đơn`, icon: '💰', color: '#f97316', trend: 'up' as const },
      { label: 'Sản phẩm', value: String(products.length), change: `${categories.length} danh mục`, icon: '📦', color: '#3b82f6', trend: 'up' as const },
      { label: 'Đơn chờ duyệt', value: String(pendingOrders), change: `${approvedOrders} đã duyệt`, icon: '🛒', color: '#10b981', trend: 'up' as const },
      { label: 'Danh mục nổi bật', value: topCategory, change: 'Từ backend', icon: '🗂️', color: '#8b5cf6', trend: 'down' as const },
    ]
  }, [categories, orders, products])

  const categorySummary = useMemo(() => {
    const total = categories.reduce((sum, category) => sum + (category.productCount || 0), 0)
    if (total === 0) {
      return []
    }

    return categories.slice(0, 4).map((category) => ({
      name: category.name,
      value: Math.round(((category.productCount || 0) / total) * 100),
      color:
        category.name === 'Laptop'
          ? '#10b981'
          : category.name === 'Điện thoại'
            ? '#3b82f6'
            : category.name === 'Máy tính bảng'
              ? '#f97316'
              : '#8b5cf6',
    }))
  }, [categories])

  const revenueByMonth = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 8 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (7 - index), 1)
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        month: date.toLocaleDateString('vi-VN', { month: 'short' }),
        value: 0,
      }
    })

    const bucketMap = new Map(months.map((item) => [item.key, item]))

    orders.forEach((order) => {
      const rawDate = order.timestamp ?? (order as { createdAt?: string }).createdAt ?? new Date().toISOString()
      const date = new Date(rawDate)
      if (Number.isNaN(date.getTime())) {
        return
      }

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const bucket = bucketMap.get(key)
      if (bucket) {
        bucket.value += order.total
      }
    })

    return months.map(({ month, value }) => ({ month, value }))
  }, [orders])

  const recentOrders = useMemo(
    () => orders.slice(0, 5),
    [orders],
  )

  const topProducts = useMemo(
    () =>
      [...products]
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 5),
    [products],
  )

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header title="BẢNG ĐIỀU KHIỂN" searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Tìm kiếm..." />
      <div style={{ padding: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ background: '#1a1f2e', padding: '24px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>{stat.icon}</span>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: stat.trend === 'up' ? '#10b98120' : '#ef444420',
                    color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                  }}
                >
                  {stat.change}
                </span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: '#8b92a7', fontSize: '13px', fontWeight: 500 }}>{stat.label}</h3>
              <p style={{ margin: 0, fontSize: stat.label === 'Danh mục nổi bật' ? '22px' : '28px', fontWeight: 700, color: 'white' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <section style={{ background: '#1a1f2e', padding: '24px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Doanh thu theo tháng</h2>
              <div style={{ color: '#8b92a7', fontSize: '13px' }}>Dữ liệu từ đơn hàng backend</div>
            </div>

            {revenueByMonth.length === 0 ? (
              <div style={{ color: '#8b92a7' }}>Chưa có dữ liệu doanh thu.</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '280px' }}>
                {revenueByMonth.map((item) => {
                  const max = Math.max(...revenueByMonth.map((entry) => entry.value))
                  const height = max > 0 ? (item.value / max) * 100 : 0

                  return (
                    <div key={item.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'flex-end' }}>
                        <div
                          title={`${item.month}: ${money(item.value)}`}
                          style={{
                            width: '100%',
                            height: `${Math.max(height, item.value > 0 ? 10 : 2)}%`,
                            minHeight: item.value > 0 ? '20px' : '4px',
                            background: 'linear-gradient(180deg, #7a73ea 0%, #f97316 100%)',
                            borderRadius: '8px 8px 0 0',
                            opacity: item.value > 0 ? 1 : 0.35,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', color: '#8b92a7' }}>{item.month}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section style={{ background: '#1a1f2e', padding: '24px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Phân bố danh mục</h2>
            {categorySummary.length === 0 ? (
              <div style={{ color: '#8b92a7' }}>Chưa có dữ liệu danh mục.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categorySummary.map((item) => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', background: item.color, borderRadius: '2px' }} />
                      <span style={{ fontSize: '14px', color: '#e5e7eb' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <section style={{ background: '#1a1f2e', padding: '24px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>Đơn hàng gần đây</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentOrders.length === 0 ? (
                <div style={{ color: '#8b92a7' }}>Chưa có đơn hàng nào.</div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px', background: '#0f1419', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{order.orderCode}</div>
                      <div style={{ fontSize: '12px', color: '#8b92a7' }}>{order.customerName}</div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f97316' }}>{money(order.total)}</div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section style={{ background: '#1a1f2e', padding: '24px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>Sản phẩm bán chạy</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topProducts.length === 0 ? (
                <div style={{ color: '#8b92a7' }}>Chưa có dữ liệu sản phẩm.</div>
              ) : (
                topProducts.map((product, index) => (
                  <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#0f1419', borderRadius: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: index < 3 ? '#f97316' : '#2a2f3e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'white',
                      }}
                    >
                      {index + 1}
                    </div>
                    <img src={product.image} alt={product.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{product.name}</div>
                      <div style={{ fontSize: '12px', color: '#8b92a7' }}>{product.sold || 0} đã bán</div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f97316' }}>{money(product.price)}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function money(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export default Dashboard
