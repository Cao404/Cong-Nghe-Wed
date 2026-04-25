import { useEffect, useMemo, useState } from 'react'
import Header from './Header'
import { api, type ApiUser } from '../api'
import { useStore } from '../store/useStore'

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const formatPercent = (value: number) => `${value.toFixed(1)}%`

const formatRelativeDate = (value?: string | null) => {
  if (!value) return 'Chưa có'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa có' : date.toLocaleDateString('vi-VN')
}

function Reports() {
  const products = useStore((state) => state.products)
  const categories = useStore((state) => state.categories)
  const orders = useStore((state) => state.pendingOrders)
  const [users, setUsers] = useState<ApiUser[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      try {
        const response = await api.getUsers()
        if (!cancelled) {
          setUsers(response)
        }
      } catch (error) {
        console.error('Failed to load users for reports:', error)
        if (!cancelled) {
          setUsers([])
        }
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [])

  const customerUsers = useMemo(() => users.filter((user) => user.role !== 'admin'), [users])

  const reportData = useMemo(() => {
    const approvedOrders = orders.filter((order) => order.status === 'approved')
    const pendingOrders = orders.filter((order) => order.status === 'pending')
    const rejectedOrders = orders.filter((order) => order.status === 'rejected')
    const cancelledOrders = orders.filter((order) => order.status === 'cancelled')

    const totalRevenue = approvedOrders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const approvedCount = approvedOrders.length
    const conversionRate = totalOrders > 0 ? (approvedCount / totalOrders) * 100 : 0
    const averageOrderValue = approvedCount > 0 ? totalRevenue / approvedCount : 0

    const activeCustomers = customerUsers.filter((user) => user._count?.orders && user._count.orders > 0).length
    const newCustomers = customerUsers.filter((user) => {
      if (!user.createdAt) return false
      const createdAt = new Date(user.createdAt).getTime()
      if (Number.isNaN(createdAt)) return false
      const diffDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24)
      return diffDays <= 30
    }).length

    const revenueByCategory = categories.map((category) => {
      const categoryProducts = products.filter((product) => product.category === category.name)
      const revenue = categoryProducts.reduce((sum, product) => sum + product.price * (product.sold ?? 0), 0)
      const sold = categoryProducts.reduce((sum, product) => sum + (product.sold ?? 0), 0)

      return {
        name: category.name,
        orders: category.productCount ?? categoryProducts.length,
        revenue,
        sold,
      }
    })

    const topProducts = [...products]
      .sort((left, right) => (right.sold ?? 0) - (left.sold ?? 0))
      .slice(0, 5)

    return {
      totalRevenue,
      totalOrders,
      approvedCount,
      pendingCount: pendingOrders.length,
      rejectedCount: rejectedOrders.length,
      cancelledCount: cancelledOrders.length,
      conversionRate,
      averageOrderValue,
      activeCustomers,
      newCustomers,
      topProducts,
      revenueByCategory: revenueByCategory.sort((left, right) => right.revenue - left.revenue).slice(0, 5),
    }
  }, [categories, customerUsers, orders, products])

  const searchTermNormalized = searchTerm.trim().toLowerCase()
  const filteredProducts = reportData.topProducts.filter((product) =>
    !searchTermNormalized || product.name.toLowerCase().includes(searchTermNormalized),
  )
  const filteredCategories = reportData.revenueByCategory.filter((category) =>
    !searchTermNormalized || category.name.toLowerCase().includes(searchTermNormalized),
  )

  const stats = [
    {
      label: 'Doanh thu đã duyệt',
      value: currency.format(reportData.totalRevenue),
      change: `${reportData.approvedCount}/${reportData.totalOrders} đơn`,
      icon: '💰',
      color: '#10b981',
    },
    {
      label: 'Tổng đơn hàng',
      value: reportData.totalOrders.toString(),
      change: `${reportData.pendingCount} chờ xử lý`,
      icon: '📦',
      color: '#3b82f6',
    },
    {
      label: 'Khách hàng hoạt động',
      value: reportData.activeCustomers.toString(),
      change: `${reportData.newCustomers} mới trong 30 ngày`,
      icon: '👥',
      color: '#8b5cf6',
    },
    {
      label: 'Tỷ lệ chuyển đổi',
      value: formatPercent(reportData.conversionRate),
      change: `${currency.format(reportData.averageOrderValue)} / đơn`,
      icon: '📈',
      color: '#f59e0b',
    },
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            marginBottom: '30px',
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: '#1a1f2e',
                padding: '28px',
                borderRadius: '12px',
                border: '1px solid #2a2f3e',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                  }}
                >
                  {stat.icon}
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: '#10b98120',
                    color: '#10b981',
                  }}
                >
                  {stat.change}
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: '#8b92a7' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: '#1a1f2e', padding: '28px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Sản phẩm bán chạy</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredProducts.length === 0 ? (
                <div style={{ color: '#8b92a7', padding: '16px 0' }}>Không có sản phẩm phù hợp</div>
              ) : (
                filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    style={{
                      padding: '16px',
                      background: '#0f1419',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: '#2a2f3e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#8b92a7',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: 'white', fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>
                          {product.name}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '13px' }}>
                          {product.sold ?? 0} đã bán • {product.category}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#10b981', fontSize: '16px', fontWeight: 600 }}>
                        {currency.format((product.sold ?? 0) * product.price)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ background: '#1a1f2e', padding: '28px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Danh mục hiệu quả</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredCategories.length === 0 ? (
                <div style={{ color: '#8b92a7', padding: '16px 0' }}>Không có danh mục phù hợp</div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.name}
                    style={{
                      padding: '16px',
                      background: '#0f1419',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'white', fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>
                        {category.name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>
                        {category.orders} sản phẩm • {category.sold} lượt bán
                      </div>
                      <div
                        style={{
                          marginTop: '10px',
                          height: '8px',
                          borderRadius: '999px',
                          background: '#1f2937',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(12, (category.revenue / Math.max(reportData.totalRevenue, 1)) * 100))}%`,
                            height: '100%',
                            borderRadius: '999px',
                            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#3b82f6', fontSize: '16px', fontWeight: 600 }}>
                        {currency.format(category.revenue)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#1a1f2e', padding: '24px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Trạng thái đơn hàng</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { label: 'Chờ xử lý', value: reportData.pendingCount, color: '#f59e0b' },
                { label: 'Đã duyệt', value: reportData.approvedCount, color: '#10b981' },
                { label: 'Từ chối', value: reportData.rejectedCount, color: '#ef4444' },
                { label: 'Đã hủy', value: reportData.cancelledCount, color: '#6b7280' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    background: '#0f1419',
                    borderRadius: '10px',
                    border: '1px solid #2a2f3e',
                  }}
                >
                  <span style={{ color: '#8b92a7', fontSize: '14px' }}>{item.label}</span>
                  <span style={{ color: item.color, fontSize: '18px', fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#1a1f2e', padding: '24px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Khách hàng mới</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {customerUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 16px',
                    background: '#0f1419',
                    borderRadius: '10px',
                    border: '1px solid #2a2f3e',
                  }}
                >
                  <div>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 500 }}>{user.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{user.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
                      {user._count?.orders ?? 0} đơn
                    </div>
                    <div style={{ color: '#8b92a7', fontSize: '12px', marginTop: '4px' }}>
                      {formatRelativeDate(user.createdAt)}
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
