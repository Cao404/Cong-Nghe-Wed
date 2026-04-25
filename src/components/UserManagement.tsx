import { useEffect, useMemo, useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { api, type ApiUser } from '../api'
import { useStore } from '../store/useStore'
import Header from './Header'

type UserForm = {
  name: string
  phone: string
  role: 'user' | 'admin'
}

const emptyForm: UserForm = {
  name: '',
  phone: '',
  role: 'user',
}

function UserManagement() {
  const currentUser = useStore((state) => state.currentUser)
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTargetId, setEditTargetId] = useState<number | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)

  useEffect(() => {
    let cancelled = false

    const loadUsers = async () => {
      try {
        setLoading(true)
        const data = await api.getUsers()

        if (!cancelled) {
          setUsers(data)
        }
      } catch (error) {
        console.error('Failed to load users:', error)
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
  }, [currentUser])

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, users],
  )

  const selectedUser = selectedUserId ? users.find((user) => user.id === selectedUserId) ?? null : null

  const openEditModal = (user: ApiUser) => {
    setEditTargetId(user.id)
    setForm({
      name: user.name,
      phone: user.phone ?? '',
      role: user.role,
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editTargetId) {
      return
    }

    try {
      const updated = await api.updateUser(editTargetId, form)
      setUsers((prev) => prev.map((user) => (user.id === editTargetId ? updated : user)))
      setShowEditModal(false)
      setEditTargetId(null)
      setForm(emptyForm)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Cập nhật người dùng thất bại')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) {
      return
    }

    try {
      await api.deleteUser(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Xóa người dùng thất bại')
    }
  }

  const stats = [
    { label: 'Tổng người dùng', value: users.length, subtext: 'Tài khoản trong hệ thống' },
    { label: 'Admin', value: users.filter((user) => user.role === 'admin').length, subtext: 'Quản trị viên' },
    { label: 'Khách hàng', value: users.filter((user) => user.role === 'user').length, subtext: 'Tài khoản người dùng' },
  ]

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header
        title="QUẢN LÝ NGƯỜI DÙNG"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm người dùng..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ background: '#1a1f2e', padding: '24px', borderRadius: '12px', border: '1px solid #2a2f3e' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{stat.value}</div>
              <div style={{ fontSize: '15px', color: '#8b92a7', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.subtext}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ color: '#8b92a7' }}>{loading ? 'Đang tải...' : `Hiển thị ${filteredUsers.length} người dùng`}</div>
        </div>

        <div style={{ background: '#1a1f2e', borderRadius: '12px', border: '1px solid #2a2f3e', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1419', borderBottom: '1px solid #2a2f3e' }}>
                <th style={thStyle}>Người dùng</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Số điện thoại</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Vai trò</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Đơn hàng</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #2a2f3e' }}>
                  <td style={tdStyle}>
                    <div style={{ color: 'white', fontWeight: 700 }}>{user.name}</div>
                    <div style={{ color: '#8b92a7', fontSize: '13px' }}>{formatDate(user.createdAt)}</div>
                  </td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>{user.phone || '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={roleBadge(user.role)}>{user.role}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{user._count?.orders ?? 0}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={() => setSelectedUserId(user.id)} style={actionButton('#3b82f6')}>Chi tiết</button>
                      <button onClick={() => openEditModal(user)} style={actionButton('#10b981')}>Sửa</button>
                      <button onClick={() => handleDelete(user.id)} style={actionButton('#ef4444')}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && (
        <Modal title="Chỉnh sửa người dùng" onClose={() => setShowEditModal(false)} onSubmit={handleUpdate} submitLabel="Cập nhật">
          <FormFields form={form} setForm={setForm} />
        </Modal>
      )}

      {selectedUser && (
        <Modal title="Chi tiết người dùng" onClose={() => setSelectedUserId(null)} hideSubmit>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div><strong>Tên:</strong> {selectedUser.name}</div>
            <div><strong>Email:</strong> {selectedUser.email}</div>
            <div><strong>Số điện thoại:</strong> {selectedUser.phone || '-'}</div>
            <div><strong>Vai trò:</strong> {selectedUser.role}</div>
            <div><strong>Ngày tạo:</strong> {formatDate(selectedUser.createdAt)}</div>
            <div><strong>Số đơn hàng:</strong> {selectedUser._count?.orders ?? 0}</div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FormFields({ form, setForm }: { form: UserForm; setForm: Dispatch<SetStateAction<UserForm>> }) {
  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Họ và tên" style={inputStyle} />
      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Số điện thoại" style={inputStyle} />
      <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'user' | 'admin' })} style={inputStyle}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
    </div>
  )
}

function Modal({
  title,
  onClose,
  onSubmit,
  submitLabel = 'Lưu',
  hideSubmit = false,
  children,
}: {
  title: string
  onClose: () => void
  onSubmit?: () => void
  submitLabel?: string
  hideSubmit?: boolean
  children: ReactNode
}) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>{title}</h2>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>
        {children}
        {!hideSubmit && onSubmit && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button onClick={onClose} style={secondaryButtonStyle}>Hủy</button>
            <button onClick={onSubmit} style={primaryButtonStyle}>{submitLabel}</button>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: CSSProperties = {
  padding: '16px 18px',
  textAlign: 'left',
  color: '#8b92a7',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
}

const tdStyle: CSSProperties = {
  padding: '16px 18px',
  color: '#cbd5e1',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: '#0f1419',
  border: '1px solid #2a2f3e',
  borderRadius: '10px',
  color: 'white',
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 1000,
}

const modalStyle: CSSProperties = {
  width: 'min(100%, 640px)',
  background: '#1a1f2e',
  border: '1px solid #2a2f3e',
  borderRadius: '16px',
  padding: '24px',
}

const closeButtonStyle: CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  border: '1px solid #2a2f3e',
  background: '#0f1419',
  color: 'white',
  cursor: 'pointer',
  fontSize: '20px',
}

const primaryButtonStyle: CSSProperties = {
  padding: '10px 16px',
  borderRadius: '10px',
  border: 'none',
  background: '#7a73ea',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

const secondaryButtonStyle: CSSProperties = {
  padding: '10px 16px',
  borderRadius: '10px',
  border: '1px solid #2a2f3e',
  background: '#0f1419',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

function actionButton(color: string): CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    background: color,
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  }
}

function roleBadge(role: string): CSSProperties {
  const color = role === 'admin' ? '#3b82f6' : '#10b981'

  return {
    padding: '6px 12px',
    borderRadius: '999px',
    background: `${color}20`,
    color,
    fontWeight: 700,
    fontSize: '13px',
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString('vi-VN')
}

export default UserManagement
