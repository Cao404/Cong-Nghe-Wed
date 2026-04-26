import { useEffect, useMemo, useState } from 'react'
import Header from './Header'
import { api, type ApiOrder, type ApiUser } from '../api'
import { useStore } from '../store/useStore'
import '../styles/khach-hang.css'
import '../styles/khach-hang.css'

type CustomerStatus = 'active' | 'inactive'
type CustomerFilter = 'all' | CustomerStatus

interface CustomerRecord {
  id: number
  name: string
  email: string
  phone: string
  avatar: string
  totalOrders: number
  totalSpent: number
  status: CustomerStatus
  joinDate: string
  lastOrder: string
  lastOrderAt: number
  recentOrders: ApiOrder[]
}

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const formatDate = (value?: string | null) => {
  if (!value) return 'Chưa có'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa có' : date.toLocaleDateString('vi-VN')
}

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Chưa có'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa có' : date.toLocaleString('vi-VN')
}

function Customers() {
  const pendingOrders = useStore((state) => state.pendingOrders)
  const [users, setUsers] = useState<ApiUser[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 8

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.getUsers()
        if (cancelled) return

        setUsers(response.filter((user) => user.role !== 'admin'))
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Không thể tải danh sách khách hàng')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [])

  const customers = useMemo<CustomerRecord[]>(() => {
    const ordersByEmail = new Map<string, ApiOrder[]>()

    for (const order of pendingOrders) {
      const email = order.customerEmail.trim().toLowerCase()
      const currentOrders = ordersByEmail.get(email) ?? []
      currentOrders.push(order)
      ordersByEmail.set(email, currentOrders)
    }

    const records = users.map((user) => {
      const userOrders = (ordersByEmail.get(user.email.toLowerCase()) ?? []).slice().sort((a, b) => {
        const left = new Date(b.createdAt ?? 0).getTime()
        const right = new Date(a.createdAt ?? 0).getTime()
        return left - right
      })

      const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0)
      const lastOrderAt = new Date(userOrders[0]?.createdAt ?? user.createdAt ?? 0).getTime()

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? 'Chưa cập nhật',
        avatar: user.name.trim().charAt(0).toUpperCase() || 'U',
        totalOrders: userOrders.length,
        totalSpent,
        status: (userOrders.length > 0 ? 'active' : 'inactive') as CustomerStatus,
        joinDate: formatDate(user.createdAt ?? null),
        lastOrder: formatDate(userOrders[0]?.createdAt ?? user.createdAt ?? null),
        lastOrderAt,
        recentOrders: userOrders,
      }
    })

    return records.sort((left, right) => {
      return right.lastOrderAt - left.lastOrderAt
    })
  }, [pendingOrders, users])

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return customers.filter((customer) => {
      const matchesTerm =
        !term ||
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.phone.toLowerCase().includes(term)

      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter

      return matchesTerm && matchesStatus
    })
  }, [customers, searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage))
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )
  const visibleIds = currentCustomers.map((customer) => customer.id)
  const pageSelectedAll = currentCustomers.length > 0 && currentCustomers.every((customer) => selectedItems.includes(customer.id))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    setSelectedItems((current) => current.filter((id) => filteredCustomers.some((customer) => customer.id === id)))
  }, [filteredCustomers])

  const stats = useMemo(() => {
    const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
    const activeCustomers = customers.filter((customer) => customer.status === 'active').length
    const inactiveCustomers = customers.length - activeCustomers

    return [
      { label: 'Tổng khách hàng', value: customers.length.toString(), icon: '👥', color: '#3b82f6' },
      { label: 'Đang hoạt động', value: activeCustomers.toString(), icon: '✅', color: '#10b981' },
      { label: 'Không hoạt động', value: inactiveCustomers.toString(), icon: '⏸️', color: '#f59e0b' },
      { label: 'Tổng chi tiêu', value: currency.format(totalSpent), icon: '💰', color: '#8b5cf6' },
    ]
  }, [customers])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems((current) => Array.from(new Set([...current, ...visibleIds])))
      return
    }

    setSelectedItems((current) => current.filter((id) => !visibleIds.includes(id)))
  }

  const handleSelectItem = (id: number) => {
    setSelectedItems((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    )
  }

  return (
    <div className="khach-hang-page">
      <Header
        title="QUẢN LÝ KHÁCH HÀNG"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm khách hàng..."
      />

      <div className="khach-hang-page__content">
        <div className="khach-hang-page__stats">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="khach-hang-page__stat"
              style={{
                background: '#1a1f2e',
                padding: '28px',
                borderRadius: '12px',
                border: '1px solid #2a2f3e',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div
                className="khach-hang-page__stat-icon"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div className="khach-hang-page__stat-value" style={{ fontSize: '32px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                  {stat.value}
                </div>
                <div className="khach-hang-page__stat-label" style={{ fontSize: '14px', color: '#8b92a7' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="khach-hang-page__panel">
          <div className="khach-hang-page__panel-header">
            <div>
              <div className="khach-hang-page__panel-title" style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>Danh sách khách hàng</div>
              <div className="khach-hang-page__panel-subtitle" style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Dữ liệu lấy từ người dùng thật và đơn hàng trên backend
              </div>
            </div>
            <div className="khach-hang-page__panel-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as CustomerFilter)}
                className="khach-hang-page__select"
                style={{
                  padding: '8px 12px',
                  background: '#0f1419',
                  border: '1px solid #2a2f3e',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>

          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            {loading
              ? 'Đang tải dữ liệu khách hàng...'
              : error
                ? error
                : `Hiển thị ${filteredCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-${Math.min(
                    currentPage * itemsPerPage,
                    filteredCustomers.length,
                  )} trong ${filteredCustomers.length} kết quả`}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1419', borderBottom: '1px solid #2a2f3e' }}>
                <th style={{ padding: '20px 28px', textAlign: 'left', width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={pageSelectedAll}
                    onChange={(event) => handleSelectAll(event.target.checked)}
                    style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                  />
                </th>
                <th
                  style={{
                    padding: '20px 28px',
                    textAlign: 'left',
                    color: '#8b92a7',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  KHÁCH HÀNG
                </th>
                <th
                  style={{
                    padding: '20px 28px',
                    textAlign: 'left',
                    color: '#8b92a7',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  LIÊN HỆ
                </th>
                <th
                  style={{
                    padding: '20px 28px',
                    textAlign: 'center',
                    color: '#8b92a7',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  ĐƠN HÀNG
                </th>
                <th
                  style={{
                    padding: '20px 28px',
                    textAlign: 'left',
                    color: '#8b92a7',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  TỔNG CHI TIÊU
                </th>
                <th
                  style={{
                    padding: '20px 28px',
                    textAlign: 'left',
                    color: '#8b92a7',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  NGÀY THAM GIA
                </th>
                <th
                  style={{
                    padding: '20px 28px',
                    textAlign: 'left',
                    color: '#8b92a7',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  ĐƠN CUỐI
                </th>
                <th
                  style={{
                    padding: '20px 28px',
                    textAlign: 'center',
                    color: '#8b92a7',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  TRẠNG THÁI
                </th>
                <th
                  style={{
                    padding: '20px 28px',
                    textAlign: 'center',
                    color: '#8b92a7',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px 28px', textAlign: 'center', color: '#8b92a7' }}>
                    Không tìm thấy khách hàng phù hợp
                  </td>
                </tr>
              ) : (
                currentCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }}
                    onMouseEnter={(event) => (event.currentTarget.style.background = '#0f1419')}
                    onMouseLeave={(event) => (event.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '24px 28px' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(customer.id)}
                        onChange={() => handleSelectItem(customer.id)}
                        style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                      />
                    </td>
                    <td style={{ padding: '24px 28px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            flexShrink: 0,
                          }}
                        >
                          {customer.avatar}
                        </div>
                        <div>
                          <div style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>
                            {customer.name}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '13px' }}>
                            ID: #{customer.id.toString().padStart(4, '0')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px 28px' }}>
                      <div style={{ color: '#8b92a7', fontSize: '15px', marginBottom: '4px' }}>{customer.email}</div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>{customer.phone}</div>
                    </td>
                    <td style={{ padding: '24px 28px', textAlign: 'center', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                      {customer.totalOrders}
                    </td>
                    <td style={{ padding: '24px 28px', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                      {currency.format(customer.totalSpent)}
                    </td>
                    <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{customer.joinDate}</td>
                    <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{customer.lastOrder}</td>
                    <td style={{ padding: '24px 28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 600,
                            background: customer.status === 'active' ? '#10b98120' : '#6b728020',
                            color: customer.status === 'active' ? '#10b981' : '#6b7280',
                          }}
                        >
                          {customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          style={{
                            padding: '8px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                          }}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid #2a2f3e',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  background: currentPage === 1 ? '#1a1f2e' : '#2a2f3e',
                  color: currentPage === 1 ? '#6b7280' : 'white',
                  border: '1px solid #2a2f3e',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                ← Trước
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 14px',
                    background: currentPage === page ? '#f97316' : '#2a2f3e',
                    color: 'white',
                    border: '1px solid #2a2f3e',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: currentPage === page ? 600 : 500,
                    minWidth: '40px',
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  background: currentPage === totalPages ? '#1a1f2e' : '#2a2f3e',
                  color: currentPage === totalPages ? '#6b7280' : 'white',
                  border: '1px solid #2a2f3e',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '760px',
              maxHeight: '90vh',
              overflow: 'auto',
              background: '#1a1f2e',
              border: '1px solid #2a2f3e',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                padding: '24px',
                borderBottom: '1px solid #2a2f3e',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: 'white', fontSize: '22px' }}>{selectedCustomer.name}</h2>
                <div style={{ color: '#8b92a7', marginTop: '6px', fontSize: '14px' }}>{selectedCustomer.email}</div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: '1px solid #2a2f3e',
                  background: '#0f1419',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px', display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#0f1419', border: '1px solid #2a2f3e', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ color: '#8b92a7', fontSize: '12px', marginBottom: '8px' }}>Tổng đơn</div>
                  <div style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>{selectedCustomer.totalOrders}</div>
                </div>
                <div style={{ background: '#0f1419', border: '1px solid #2a2f3e', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ color: '#8b92a7', fontSize: '12px', marginBottom: '8px' }}>Tổng chi tiêu</div>
                  <div style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>{currency.format(selectedCustomer.totalSpent)}</div>
                </div>
                <div style={{ background: '#0f1419', border: '1px solid #2a2f3e', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ color: '#8b92a7', fontSize: '12px', marginBottom: '8px' }}>Ngày tham gia</div>
                  <div style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>{selectedCustomer.joinDate}</div>
                </div>
              </div>

              <div>
                <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                  Đơn hàng gần đây
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedCustomer.recentOrders.length === 0 ? (
                    <div style={{ color: '#8b92a7', background: '#0f1419', border: '1px solid #2a2f3e', borderRadius: '12px', padding: '18px' }}>
                      Chưa có đơn hàng nào
                    </div>
                  ) : (
                    selectedCustomer.recentOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '16px',
                          alignItems: 'center',
                          background: '#0f1419',
                          border: '1px solid #2a2f3e',
                          borderRadius: '12px',
                          padding: '16px',
                        }}
                      >
                        <div>
                          <div style={{ color: 'white', fontSize: '15px', fontWeight: 600 }}>{order.orderCode}</div>
                          <div style={{ color: '#8b92a7', fontSize: '13px', marginTop: '4px' }}>
                            {formatDateTime(order.createdAt)} • {order.items.length} sản phẩm
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#10b981', fontSize: '15px', fontWeight: 600 }}>
                            {currency.format(order.total)}
                          </div>
                          <div
                            style={{
                              color:
                                order.status === 'approved'
                                  ? '#10b981'
                                  : order.status === 'rejected'
                                    ? '#ef4444'
                                    : order.status === 'cancelled'
                                      ? '#f59e0b'
                                      : '#3b82f6',
                              fontSize: '12px',
                              marginTop: '4px',
                              textTransform: 'capitalize',
                            }}
                          >
                            {order.status}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
