import { useEffect, useMemo, useState } from 'react'
import Header from './Header'
import { api, type ApiOrderHistoryEntry, type ApiUser } from '../api'
import { useStore } from '../store/useStore'

type UserRole = 'admin' | 'user'
type TabKey = 'users' | 'logs'

interface ActivityLog {
  id: string
  user: string
  action: string
  target: string
  timestamp: string
  timestampAt: number
  status: 'success' | 'failed'
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
const getRoleColor = (role: UserRole) => (role === 'admin' ? '#ef4444' : '#3b82f6')

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
  const [editFormData, setEditFormData] = useState<{
    name: string
    phone: string
    role: UserRole
  }>({
    name: '',
    phone: '',
    role: 'user',
  })

  const itemsPerPage = 8

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.getUsers()
        if (!cancelled) {
          setUsers(response.map(mapUser))
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Không thể tải danh sách phân quyền')
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
      { label: 'Tổng người dùng', value: userCount.toString(), icon: '👤', color: '#3b82f6' },
      { label: 'Quản trị viên', value: adminCount.toString(), icon: '🔐', color: '#ef4444' },
      { label: 'Đơn hàng liên quan', value: totalOrders.toString(), icon: '📦', color: '#10b981' },
      { label: 'Quyền được gán', value: activePermissions.toString(), icon: '🛡️', color: '#f59e0b' },
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
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header
        title="PHÂN QUYỀN & NHẬT KÝ"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm người dùng..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '30px' }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
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
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: '#8b92a7' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#1a1f2e', borderRadius: '8px', border: '1px solid #2a2f3e', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #2a2f3e', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('users')}
              style={tabButtonStyle(activeTab === 'users')}
            >
              Người dùng ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              style={tabButtonStyle(activeTab === 'logs')}
            >
              Nhật ký hoạt động ({activityLogs.length})
            </button>
          </div>

          {activeTab === 'users' && (
            <>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
                {loading
                  ? 'Đang tải dữ liệu phân quyền...'
                  : error
                    ? error
                    : `Hiển thị ${filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-${Math.min(
                        currentPage * itemsPerPage,
                        filteredUsers.length,
                      )} trong ${filteredUsers.length} kết quả`}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f1419', borderBottom: '1px solid #2a2f3e' }}>
                    <th style={thCell}>Người dùng</th>
                    <th style={thCell}>Vai trò</th>
                    <th style={thCell}>Quyền hạn</th>
                    <th style={{ ...thCell, textAlign: 'center' }}>Đơn hàng</th>
                    <th style={thCell}>Ngày tạo</th>
                    <th style={{ ...thCell, textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && !error && currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px 28px', textAlign: 'center', color: '#8b92a7' }}>
                        Không tìm thấy người dùng phù hợp
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr
                        key={user.id}
                        style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }}
                        onMouseEnter={(event) => (event.currentTarget.style.background = '#0f1419')}
                        onMouseLeave={(event) => (event.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '24px 28px' }}>
                          <div style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>{user.name}</div>
                          <div style={{ color: '#6b7280', fontSize: '13px' }}>{user.email}</div>
                        </td>
                        <td style={{ padding: '24px 28px' }}>
                          <span style={roleBadgeStyle(user.role)}>{getRoleText(user.role)}</span>
                        </td>
                        <td style={{ padding: '24px 28px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {user.permissions.slice(0, 4).map((permission) => (
                              <span key={permission} style={permissionBadgeStyle}>
                                {permission}
                              </span>
                            ))}
                            {user.permissions.length > 4 && <span style={permissionBadgeStyle}>+{user.permissions.length - 4}</span>}
                          </div>
                        </td>
                        <td style={{ padding: '24px 28px', textAlign: 'center', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                          {user.orders}
                        </td>
                        <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{user.createdAt}</td>
                        <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                          <button onClick={() => handleEditClick(user.id)} style={primarySmallButton}>
                            Chỉnh sửa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={paginationStyle}>
                  <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} style={pagerButtonStyle(currentPage === 1)}>
                    ← Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} style={pageNumberButtonStyle(currentPage === page)}>
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    style={pagerButtonStyle(currentPage === totalPages)}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'logs' && (
            <>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
                Hiển thị {currentLogs.length === 0 ? 0 : (currentLogPage - 1) * itemsPerPage + 1}-{Math.min(
                  currentLogPage * itemsPerPage,
                  activityLogs.length,
                )} trong {activityLogs.length} kết quả
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f1419', borderBottom: '1px solid #2a2f3e' }}>
                    <th style={thCell}>Người dùng</th>
                    <th style={thCell}>Hành động</th>
                    <th style={thCell}>Đối tượng</th>
                    <th style={thCell}>Thời gian</th>
                    <th style={{ ...thCell, textAlign: 'center' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log) => (
                    <tr
                      key={log.id}
                      style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }}
                      onMouseEnter={(event) => (event.currentTarget.style.background = '#0f1419')}
                      onMouseLeave={(event) => (event.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '24px 28px', color: 'white', fontSize: '15px' }}>{log.user}</td>
                      <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{log.action}</td>
                      <td style={{ padding: '24px 28px', color: '#3b82f6', fontSize: '15px', fontWeight: 500 }}>{log.target}</td>
                      <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{log.timestamp}</td>
                      <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                        <span style={statusBadgeStyle(log.status)}>
                          {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalLogPages > 1 && (
                <div style={paginationStyle}>
                  <button
                    onClick={() => setCurrentLogPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentLogPage === 1}
                    style={pagerButtonStyle(currentLogPage === 1)}
                  >
                    ← Trước
                  </button>
                  {Array.from({ length: totalLogPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentLogPage(page)}
                      style={pageNumberButtonStyle(currentLogPage === page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentLogPage((prev) => Math.min(totalLogPages, prev + 1))}
                    disabled={currentLogPage === totalLogPages}
                    style={pagerButtonStyle(currentLogPage === totalLogPages)}
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
        <div
          style={overlayStyle}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={modalWrapStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                padding: '24px',
                borderBottom: '1px solid #2a2f3e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '20px', color: 'white' }}>Chỉnh sửa người dùng</h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>{selectedUser.name}</div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>{selectedUser.email}</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle}>Tên hiển thị</label>
                <input
                  value={editFormData.name}
                  onChange={(event) => setEditFormData((current) => ({ ...current, name: event.target.value }))}
                  style={formInputStyle}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle}>Số điện thoại</label>
                <input
                  value={editFormData.phone}
                  onChange={(event) => setEditFormData((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Nhập số điện thoại"
                  style={formInputStyle}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={formLabelStyle}>Vai trò</label>
                <select
                  value={editFormData.role}
                  onChange={(event) => setEditFormData((current) => ({ ...current, role: event.target.value as UserRole }))}
                  style={formInputStyle}
                >
                  <option value="user">Người dùng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={formLabelStyle}>Quyền suy ra từ vai trò</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                  {getPermissionsByRole(editFormData.role).map((permission) => (
                    <div key={permission} style={permissionPreviewStyle}>
                      {permission}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowEditModal(false)} style={secondaryButtonStyle}>
                  Hủy
                </button>
                <button onClick={() => void handleUpdateUser()} style={primaryButtonStyle}>
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

function tabButtonStyle(active: boolean): React.CSSProperties {
  return {
    padding: '18px 28px',
    background: active ? '#0f1419' : 'transparent',
    color: active ? '#3b82f6' : '#8b92a7',
    border: 'none',
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: active ? 600 : 400,
    whiteSpace: 'nowrap',
  }
}

function statusBadgeStyle(status: 'success' | 'failed'): React.CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    background: status === 'success' ? '#10b98120' : '#ef444420',
    color: status === 'success' ? '#10b981' : '#ef4444',
  }
}

const thCell: React.CSSProperties = {
  padding: '20px 28px',
  textAlign: 'left',
  color: '#8b92a7',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
}

const roleBadgeStyle = (role: UserRole): React.CSSProperties => ({
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  background: `${getRoleColor(role)}20`,
  color: getRoleColor(role),
})

const permissionBadgeStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  background: '#374151',
  color: '#9ca3af',
}

const primarySmallButton: React.CSSProperties = {
  padding: '8px 16px',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
}

const primaryButtonStyle: React.CSSProperties = {
  ...primarySmallButton,
  padding: '12px 24px',
  fontSize: '15px',
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: '#2a2f3e',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 500,
}

const paginationStyle: React.CSSProperties = {
  padding: '24px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  borderTop: '1px solid #2a2f3e',
  flexWrap: 'wrap',
}

const pagerButtonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  background: disabled ? '#1a1f2e' : '#2a2f3e',
  color: disabled ? '#6b7280' : 'white',
  border: '1px solid #2a2f3e',
  borderRadius: '6px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '14px',
})

const pageNumberButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  background: active ? '#f97316' : '#2a2f3e',
  color: 'white',
  border: '1px solid #2a2f3e',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  minWidth: '40px',
})

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
}

const modalWrapStyle: React.CSSProperties = {
  background: '#1a1f2e',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '620px',
  maxHeight: '90vh',
  overflow: 'auto',
  border: '1px solid #2a2f3e',
}

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#6b7280',
  fontSize: '24px',
  cursor: 'pointer',
  padding: '0',
  width: '32px',
  height: '32px',
}

const formLabelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  color: '#8b92a7',
  fontSize: '13px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const formInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  background: '#0f1419',
  border: '1px solid #2a2f3e',
  borderRadius: '6px',
  color: 'white',
  fontSize: '15px',
}

const permissionPreviewStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '8px',
  background: '#0f1419',
  border: '1px solid #2a2f3e',
  color: '#8b92a7',
  fontSize: '14px',
  textAlign: 'center',
}

export default Rights
