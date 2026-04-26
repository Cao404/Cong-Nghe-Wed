import { useEffect, useMemo, useState } from 'react'
import Header from './Header'
import { api, type ApiOrderHistoryEntry, type ApiUser } from '../api'
import { useStore } from '../store/useStore'
import '../styles/phan-quyen-nhat-ky.css'

type UserRole = 'admin' | 'user'
type TabKey = 'users' | 'logs'
type ActivityStatus = 'success' | 'failed'

interface ActivityLog {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
  timestampAt: number
  status: ActivityStatus
}

interface EditableUser {
  id: number
  name: string
  email: string
  role: UserRole
  phone: string
  createdAt: string
  createdAtAt: number
  orders: number
  permissions: string[]
}

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return 'Chưa có'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa có' : date.toLocaleString('vi-VN')
}

const getRoleText = (role: UserRole) => (role === 'admin' ? 'Quản trị viên' : 'Người dùng')
const getRoleTone = (role: UserRole) => (role === 'admin' ? 'danger' : 'primary')

const getPermissionsByRole = (role: UserRole) =>
  role === 'admin'
    ? ['all', 'products', 'orders', 'users', 'category', 'reports', 'shipping', 'warranty']
    : ['view']

const mapUser = (user: ApiUser): EditableUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: (user.role ?? 'user') as UserRole,
  phone: user.phone ?? 'Chưa cập nhật',
  createdAt: formatDateTime(user.createdAt ?? null),
  createdAtAt: new Date(user.createdAt ?? 0).getTime(),
  orders: user._count?.orders ?? 0,
  permissions: getPermissionsByRole((user.role ?? 'user') as UserRole),
})

function Rights() {
  const orders = useStore((state) => state.pendingOrders)
  const [activeTab, setActiveTab] = useState<TabKey>('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [currentLogPage, setCurrentLogPage] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [users, setUsers] = useState<EditableUser[]>([])
  const [orderLogs, setOrderLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    role: 'user' as UserRole,
  })

  const itemsPerPage = 8

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.getUsers()
        if (!cancelled) setUsers(response.map(mapUser))
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Không thể tải danh sách phân quyền')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadUsers()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadOrderLogs = async () => {
      try {
        const recentOrders = [...orders]
          .sort((left, right) => new Date(right.timestamp ?? 0).getTime() - new Date(left.timestamp ?? 0).getTime())
          .slice(0, 20)

        const historyResults = await Promise.allSettled(
          recentOrders.map(async (order) => {
            const history = await api.getOrderHistory(order.id)
            return history.map((entry) => mapOrderHistoryEntry(entry, order.orderCode))
          }),
        )

        if (cancelled) return

        const flattened = historyResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
        setOrderLogs(flattened.sort((left, right) => right.timestampAt - left.timestampAt))
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load order logs:', loadError)
          setOrderLogs([])
        }
      }
    }

    void loadOrderLogs()

    return () => {
      cancelled = true
    }
  }, [orders])

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return users

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      )
    })
  }, [searchTerm, users])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeTab])

  useEffect(() => {
    setCurrentLogPage(1)
  }, [activeTab])

  const userLogs = useMemo(() => {
    return [...users]
      .sort((left, right) => right.createdAtAt - left.createdAtAt)
      .slice(0, 5)
      .map((user) => ({
        id: `user-${user.id}`,
        user: user.name,
        action: user.role === 'admin' ? 'Phân quyền quản trị' : 'Tạo tài khoản',
        target: user.email,
        timestamp: user.createdAt,
        timestampAt: user.createdAtAt,
        status: 'success' as const,
      }))
  }, [users])

  const activityLogs = useMemo<ActivityLog[]>(() => {
    return [...orderLogs, ...userLogs]
      .sort((left, right) => right.timestampAt - left.timestampAt)
      .slice(0, 12)
  }, [orderLogs, userLogs])

  const totalLogPages = Math.max(1, Math.ceil(activityLogs.length / itemsPerPage))
  const currentLogs = activityLogs.slice((currentLogPage - 1) * itemsPerPage, currentLogPage * itemsPerPage)

  const stats = useMemo(() => {
    const adminCount = users.filter((user) => user.role === 'admin').length
    const userCount = users.length
    const totalOrders = orders.length
    const activePermissions = users.reduce((sum, user) => sum + user.permissions.length, 0)

    return [
      { label: 'Tổng người dùng', value: userCount.toString(), icon: '👤', tone: 'blue' as const },
      { label: 'Quản trị viên', value: adminCount.toString(), icon: '🔐', tone: 'red' as const },
      { label: 'Đơn hàng liên quan', value: totalOrders.toString(), icon: '📦', tone: 'green' as const },
      { label: 'Quyền được gán', value: activePermissions.toString(), icon: '🛡️', tone: 'amber' as const },
    ]
  }, [orders.length, users])

  const handleEditClick = (userId: number) => {
    const user = users.find((item) => item.id === userId)
    if (!user) return

    setSelectedUserId(userId)
    setEditFormData({
      name: user.name,
      phone: user.phone === 'Chưa cập nhật' ? '' : user.phone,
      role: user.role,
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUserId) return

    try {
      const updated = await api.updateUser(selectedUserId, {
        name: editFormData.name.trim() || undefined,
        phone: editFormData.phone.trim() || undefined,
        role: editFormData.role,
      })

      setUsers((current) =>
        current.map((user) =>
          user.id === selectedUserId
            ? {
                ...user,
                name: updated.name,
                email: updated.email,
                role: (updated.role ?? 'user') as UserRole,
                phone: updated.phone ?? 'Chưa cập nhật',
                permissions: getPermissionsByRole((updated.role ?? 'user') as UserRole),
              }
            : user,
        ),
      )

      setShowEditModal(false)
      setSelectedUserId(null)
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : 'Không thể cập nhật người dùng')
    }
  }

  const selectedUser = selectedUserId ? users.find((item) => item.id === selectedUserId) ?? null : null

  return (
    <div className="phan-quyen-page">
      <Header
        title="PHÂN QUYỀN & NHẬT KÝ"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm người dùng..."
      />

      <div className="phan-quyen-page__content">
        <div className="phan-quyen-page__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="phan-quyen-page__stat">
              <div className={`phan-quyen-page__stat-icon phan-quyen-page__stat-icon--${stat.tone}`}>{stat.icon}</div>
              <div>
                <div className="phan-quyen-page__stat-value">{stat.value}</div>
                <div className="phan-quyen-page__stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="phan-quyen-page__panel">
          <div className="phan-quyen-page__tabs">
            <button
              onClick={() => setActiveTab('users')}
              className={`phan-quyen-page__tab ${activeTab === 'users' ? 'phan-quyen-page__tab--active' : ''}`}
            >
              Người dùng ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`phan-quyen-page__tab ${activeTab === 'logs' ? 'phan-quyen-page__tab--active' : ''}`}
            >
              Nhật ký hoạt động ({activityLogs.length})
            </button>
          </div>

          {activeTab === 'users' && (
            <>
              <div className="phan-quyen-page__summary">
                {loading
                  ? 'Đang tải dữ liệu phân quyền...'
                  : error
                    ? error
                    : `Hiển thị ${filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-${Math.min(
                        currentPage * itemsPerPage,
                        filteredUsers.length,
                      )} trong ${filteredUsers.length} kết quả`}
              </div>

              <table className="phan-quyen-page__table">
                <thead>
                  <tr className="phan-quyen-page__thead">
                    <th className="phan-quyen-page__th">Người dùng</th>
                    <th className="phan-quyen-page__th">Vai trò</th>
                    <th className="phan-quyen-page__th">Quyền hạn</th>
                    <th className="phan-quyen-page__th phan-quyen-page__th--center">Đơn hàng</th>
                    <th className="phan-quyen-page__th">Ngày tạo</th>
                    <th className="phan-quyen-page__th phan-quyen-page__th--center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && !error && currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="phan-quyen-page__empty">
                        Không tìm thấy người dùng phù hợp
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr key={user.id} className="phan-quyen-page__row">
                        <td className="phan-quyen-page__td">
                          <div className="phan-quyen-page__user-name">{user.name}</div>
                          <div className="phan-quyen-page__user-email">{user.email}</div>
                        </td>
                        <td className="phan-quyen-page__td">
                          <span className={`phan-quyen-page__role-badge phan-quyen-page__role-badge--${getRoleTone(user.role)}`}>
                            {getRoleText(user.role)}
                          </span>
                        </td>
                        <td className="phan-quyen-page__td">
                          <div className="phan-quyen-page__permission-list">
                            {user.permissions.slice(0, 4).map((permission) => (
                              <span key={permission} className="phan-quyen-page__permission-badge">
                                {permission}
                              </span>
                            ))}
                            {user.permissions.length > 4 && (
                              <span className="phan-quyen-page__permission-badge">+{user.permissions.length - 4}</span>
                            )}
                          </div>
                        </td>
                        <td className="phan-quyen-page__td phan-quyen-page__td--center">{user.orders}</td>
                        <td className="phan-quyen-page__td phan-quyen-page__td--muted">{user.createdAt}</td>
                        <td className="phan-quyen-page__td phan-quyen-page__actions">
                          <button onClick={() => handleEditClick(user.id)} className="phan-quyen-page__button phan-quyen-page__button--primary">
                            Chỉnh sửa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="phan-quyen-page__pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`phan-quyen-page__pager ${currentPage === 1 ? 'phan-quyen-page__pager--disabled' : ''}`}
                  >
                    ← Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`phan-quyen-page__page ${currentPage === page ? 'phan-quyen-page__page--active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`phan-quyen-page__pager ${currentPage === totalPages ? 'phan-quyen-page__pager--disabled' : ''}`}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'logs' && (
            <>
              <div className="phan-quyen-page__summary">
                Hiển thị {currentLogs.length === 0 ? 0 : (currentLogPage - 1) * itemsPerPage + 1}-
                {Math.min(currentLogPage * itemsPerPage, activityLogs.length)} trong {activityLogs.length} kết quả
              </div>

              <table className="phan-quyen-page__table">
                <thead>
                  <tr className="phan-quyen-page__thead">
                    <th className="phan-quyen-page__th">Người dùng</th>
                    <th className="phan-quyen-page__th">Hành động</th>
                    <th className="phan-quyen-page__th">Đối tượng</th>
                    <th className="phan-quyen-page__th">Thời gian</th>
                    <th className="phan-quyen-page__th phan-quyen-page__th--center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log) => (
                    <tr key={log.id} className="phan-quyen-page__row">
                      <td className="phan-quyen-page__td phan-quyen-page__td--muted">{log.user}</td>
                      <td className="phan-quyen-page__td phan-quyen-page__td--muted">{log.action}</td>
                      <td className="phan-quyen-page__td phan-quyen-page__target">{log.target}</td>
                      <td className="phan-quyen-page__td phan-quyen-page__td--muted">{log.timestamp}</td>
                      <td className="phan-quyen-page__td phan-quyen-page__td--center">
                        <span className={`phan-quyen-page__status phan-quyen-page__status--${log.status}`}>
                          {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalLogPages > 1 && (
                <div className="phan-quyen-page__pagination">
                  <button
                    onClick={() => setCurrentLogPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentLogPage === 1}
                    className={`phan-quyen-page__pager ${currentLogPage === 1 ? 'phan-quyen-page__pager--disabled' : ''}`}
                  >
                    ← Trước
                  </button>
                  {Array.from({ length: totalLogPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentLogPage(page)}
                      className={`phan-quyen-page__page ${currentLogPage === page ? 'phan-quyen-page__page--active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentLogPage((prev) => Math.min(totalLogPages, prev + 1))}
                    disabled={currentLogPage === totalLogPages}
                    className={`phan-quyen-page__pager ${currentLogPage === totalLogPages ? 'phan-quyen-page__pager--disabled' : ''}`}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showEditModal && selectedUser && (
        <div className="phan-quyen-page__modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="phan-quyen-page__modal" onClick={(event) => event.stopPropagation()}>
            <div className="phan-quyen-page__modal-header">
              <h2 className="phan-quyen-page__modal-title">Chỉnh sửa người dùng</h2>
              <button onClick={() => setShowEditModal(false)} className="phan-quyen-page__modal-close">
                ×
              </button>
            </div>

            <div className="phan-quyen-page__modal-body">
              <div className="phan-quyen-page__user-card">
                <div className="phan-quyen-page__user-card-name">{selectedUser.name}</div>
                <div className="phan-quyen-page__user-card-email">{selectedUser.email}</div>
              </div>

              <div className="phan-quyen-page__form-group">
                <label className="phan-quyen-page__form-label">Tên hiển thị</label>
                <input
                  value={editFormData.name}
                  onChange={(event) => setEditFormData((current) => ({ ...current, name: event.target.value }))}
                  className="phan-quyen-page__input"
                />
              </div>

              <div className="phan-quyen-page__form-group">
                <label className="phan-quyen-page__form-label">Số điện thoại</label>
                <input
                  value={editFormData.phone}
                  onChange={(event) => setEditFormData((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Nhập số điện thoại"
                  className="phan-quyen-page__input"
                />
              </div>

              <div className="phan-quyen-page__form-group">
                <label className="phan-quyen-page__form-label">Vai trò</label>
                <select
                  value={editFormData.role}
                  onChange={(event) => setEditFormData((current) => ({ ...current, role: event.target.value as UserRole }))}
                  className="phan-quyen-page__input"
                >
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div className="phan-quyen-page__form-group phan-quyen-page__form-group--last">
                <label className="phan-quyen-page__form-label">Quyền suy ra từ vai trò</label>
                <div className="phan-quyen-page__form-grid">
                  {getPermissionsByRole(editFormData.role).map((permission) => (
                    <div key={permission} className="phan-quyen-page__permission-preview">
                      {permission}
                    </div>
                  ))}
                </div>
              </div>

              <div className="phan-quyen-page__form-actions">
                <button onClick={() => setShowEditModal(false)} className="phan-quyen-page__button phan-quyen-page__button--secondary">
                  Hủy
                </button>
                <button onClick={() => void handleUpdateUser()} className="phan-quyen-page__button phan-quyen-page__button--primary phan-quyen-page__button--large">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function mapOrderHistoryEntry(entry: ApiOrderHistoryEntry, orderCode: string): ActivityLog {
  const actionMap: Record<string, string> = {
    created: 'Tạo đơn hàng',
    approved: 'Duyệt đơn hàng',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    rejected: 'Từ chối đơn hàng',
    cancelled: 'Hủy đơn hàng',
  }

  const timestampAt = new Date(entry.createdAt).getTime()

  return {
    id: `order-${entry.orderId}-${entry.id}`,
    user: entry.actorName,
    action: actionMap[entry.action] || entry.action,
    target: orderCode,
    timestamp: formatDateTime(entry.createdAt),
    timestampAt: Number.isNaN(timestampAt) ? 0 : timestampAt,
    status: entry.action === 'rejected' || entry.action === 'cancelled' ? 'failed' : 'success',
  }
}

export default Rights
