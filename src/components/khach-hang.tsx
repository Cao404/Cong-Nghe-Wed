import { useEffect, useMemo, useState } from 'react'
import Header from './Header'
import { api, type ApiOrder, type ApiUser } from '../api'
import { useStore } from '../store/useStore'
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
      { label: 'Tổng khách hàng', value: customers.length.toString(), icon: '👥', tone: 'blue' as const },
      { label: 'Đang hoạt động', value: activeCustomers.toString(), icon: '✅', tone: 'green' as const },
      { label: 'Không hoạt động', value: inactiveCustomers.toString(), icon: '⏸️', tone: 'amber' as const },
      { label: 'Tổng chi tiêu', value: currency.format(totalSpent), icon: '💰', tone: 'purple' as const },
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
            >
              <div className={`khach-hang-page__stat-icon khach-hang-page__stat-icon--${stat.tone}`}>
                {stat.icon}
              </div>
              <div>
                <div className="khach-hang-page__stat-value">
                  {stat.value}
                </div>
                <div className="khach-hang-page__stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="khach-hang-page__panel">
          <div className="khach-hang-page__panel-header">
            <div>
              <div className="khach-hang-page__panel-title">Danh sách khách hàng</div>
              <div className="khach-hang-page__panel-subtitle">
                Dữ liệu lấy từ người dùng thật và đơn hàng trên backend
              </div>
            </div>
            <div className="khach-hang-page__panel-controls">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as CustomerFilter)}
                className="khach-hang-page__select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>

          <div className="khach-hang-page__summary">
            {loading
              ? 'Đang tải dữ liệu khách hàng...'
              : error
                ? error
                : `Hiển thị ${filteredCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-${Math.min(
                    currentPage * itemsPerPage,
                    filteredCustomers.length,
                  )} trong ${filteredCustomers.length} kết quả`}
          </div>

          <table className="khach-hang-page__table">
            <thead>
              <tr className="khach-hang-page__table-head-row">
                <th className="khach-hang-page__th khach-hang-page__th--checkbox">
                  <input
                    type="checkbox"
                    checked={pageSelectedAll}
                    onChange={(event) => handleSelectAll(event.target.checked)}
                    className="khach-hang-page__checkbox"
                  />
                </th>
                <th className="khach-hang-page__th">
                  KHÁCH HÀNG
                </th>
                <th className="khach-hang-page__th">
                  LIÊN HỆ
                </th>
                <th className="khach-hang-page__th khach-hang-page__th--center">
                  ĐƠN HÀNG
                </th>
                <th className="khach-hang-page__th">
                  TỔNG CHI TIÊU
                </th>
                <th className="khach-hang-page__th">
                  NGÀY THAM GIA
                </th>
                <th className="khach-hang-page__th">
                  ĐƠN CUỐI
                </th>
                <th className="khach-hang-page__th khach-hang-page__th--center">
                  TRẠNG THÁI
                </th>
                <th className="khach-hang-page__th khach-hang-page__th--center">
                  THAO TÁC
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="khach-hang-page__empty-cell">
                    Không tìm thấy khách hàng phù hợp
                  </td>
                </tr>
              ) : (
                currentCustomers.map((customer) => (
                  <tr key={customer.id} className="khach-hang-page__table-row">
                    <td className="khach-hang-page__td">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(customer.id)}
                        onChange={() => handleSelectItem(customer.id)}
                        className="khach-hang-page__checkbox"
                      />
                    </td>
                    <td className="khach-hang-page__td">
                      <div className="khach-hang-page__customer">
                        <div className="khach-hang-page__avatar">
                          {customer.avatar}
                        </div>
                        <div>
                          <div className="khach-hang-page__name">
                            {customer.name}
                          </div>
                          <div className="khach-hang-page__muted">
                            ID: #{customer.id.toString().padStart(4, '0')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="khach-hang-page__td">
                      <div className="khach-hang-page__td--muted">{customer.email}</div>
                      <div className="khach-hang-page__muted">{customer.phone}</div>
                    </td>
                    <td className="khach-hang-page__td khach-hang-page__td--center">
                      {customer.totalOrders}
                    </td>
                    <td className="khach-hang-page__td khach-hang-page__td--money">
                      {currency.format(customer.totalSpent)}
                    </td>
                    <td className="khach-hang-page__td khach-hang-page__td--muted">{customer.joinDate}</td>
                    <td className="khach-hang-page__td khach-hang-page__td--muted">{customer.lastOrder}</td>
                    <td className="khach-hang-page__td">
                      <div className="khach-hang-page__status-wrap">
                        <span
                          className={`khach-hang-page__status ${customer.status === 'active' ? 'khach-hang-page__status--active' : 'khach-hang-page__status--inactive'}`}
                        >
                          {customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </td>
                    <td className="khach-hang-page__td khach-hang-page__td--center">
                      <div className="khach-hang-page__actions">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="khach-hang-page__action-button"
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
            <div className="khach-hang-page__pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`khach-hang-page__pagination-button khach-hang-page__pagination-button--base ${currentPage === 1 ? 'khach-hang-page__pagination-button--disabled' : 'khach-hang-page__pagination-button--idle'}`}
              >
                ← Trước
              </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`khach-hang-page__pagination-button khach-hang-page__pagination-button--base ${currentPage === page ? 'khach-hang-page__pagination-button--active' : 'khach-hang-page__pagination-button--idle'}`}
                  >
                    {page}
                  </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`khach-hang-page__pagination-button khach-hang-page__pagination-button--base ${currentPage === totalPages ? 'khach-hang-page__pagination-button--disabled' : 'khach-hang-page__pagination-button--idle'}`}
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div className="khach-hang-page__modal" onClick={() => setSelectedCustomer(null)}>
          <div className="khach-hang-page__modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="khach-hang-page__modal-header">
              <div>
                <h2 className="khach-hang-page__modal-title">{selectedCustomer.name}</h2>
                <div className="khach-hang-page__modal-subtitle">{selectedCustomer.email}</div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="khach-hang-page__modal-close"
              >
                ×
              </button>
            </div>

            <div className="khach-hang-page__modal-body">
              <div className="khach-hang-page__modal-grid">
                <div className="khach-hang-page__modal-card-mini">
                  <div className="khach-hang-page__mini-label">Tổng đơn</div>
                  <div className="khach-hang-page__mini-value">{selectedCustomer.totalOrders}</div>
                </div>
                <div className="khach-hang-page__modal-card-mini">
                  <div className="khach-hang-page__mini-label">Tổng chi tiêu</div>
                  <div className="khach-hang-page__mini-value">{currency.format(selectedCustomer.totalSpent)}</div>
                </div>
                <div className="khach-hang-page__modal-card-mini">
                  <div className="khach-hang-page__mini-label">Ngày tham gia</div>
                  <div className="khach-hang-page__mini-value">{selectedCustomer.joinDate}</div>
                </div>
              </div>

              <div className="khach-hang-page__modal-section">
                <div className="khach-hang-page__recent-title">
                  Đơn hàng gần đây
                </div>
                <div className="khach-hang-page__recent-list">
                  {selectedCustomer.recentOrders.length === 0 ? (
                    <div className="khach-hang-page__recent-empty">
                      Chưa có đơn hàng nào
                    </div>
                  ) : (
                    selectedCustomer.recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="khach-hang-page__recent-item">
                        <div>
                          <div className="khach-hang-page__recent-code">{order.orderCode}</div>
                          <div className="khach-hang-page__recent-meta">
                            {formatDateTime(order.createdAt)} • {order.items.length} sản phẩm
                          </div>
                        </div>
                        <div className="khach-hang-page__recent-right">
                          <div className="khach-hang-page__recent-money">
                            {currency.format(order.total)}
                          </div>
                          <div
                            className={`khach-hang-page__recent-status ${
                              order.status === 'approved'
                                ? 'khach-hang-page__recent-status--approved'
                                : order.status === 'rejected'
                                  ? 'khach-hang-page__recent-status--rejected'
                                  : order.status === 'cancelled'
                                    ? 'khach-hang-page__recent-status--cancelled'
                                    : 'khach-hang-page__recent-status--default'
                            }`}
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
