import { useState } from 'react'

interface User {
  id: number
  name: string
  email: string
  phone: string
  role: 'admin' | 'user' | 'seller'
  status: 'active' | 'inactive' | 'banned'
  registeredDate: string
  lastLogin: string
}

function UserManagement() {
  const [activeTab, setActiveTab] = useState<'all' | 'admin' | 'user' | 'seller' | 'active' | 'banned'>('all')
  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const users: User[] = [
    { id: 1, name: 'Admin Nguyễn', email: 'admin@shop.vn', phone: '0901111111', role: 'admin', status: 'active', registeredDate: '2023-01-01', lastLogin: '2024-03-31' },
    { id: 2, name: 'Trần Văn User', email: 'user1@gmail.com', phone: '0902222222', role: 'user', status: 'active', registeredDate: '2024-01-15', lastLogin: '2024-03-30' },
    { id: 3, name: 'Lê Thị Seller', email: 'seller1@shop.vn', phone: '0903333333', role: 'seller', status: 'active', registeredDate: '2024-02-01', lastLogin: '2024-03-31' },
    { id: 4, name: 'Phạm Văn Banned', email: 'banned@gmail.com', phone: '0904444444', role: 'user', status: 'banned', registeredDate: '2024-01-20', lastLogin: '2024-03-15' },
    { id: 5, name: 'Hoàng Thị User2', email: 'user2@gmail.com', phone: '0905555555', role: 'user', status: 'active', registeredDate: '2024-02-10', lastLogin: '2024-03-29' },
    { id: 6, name: 'Vũ Văn Seller2', email: 'seller2@shop.vn', phone: '0906666666', role: 'seller', status: 'active', registeredDate: '2024-02-15', lastLogin: '2024-03-31' },
    { id: 7, name: 'Đỗ Thị Inactive', email: 'inactive@gmail.com', phone: '0907777777', role: 'user', status: 'inactive', registeredDate: '2024-01-05', lastLogin: '2024-02-01' },
    { id: 8, name: 'Bùi Văn User3', email: 'user3@gmail.com', phone: '0908888888', role: 'user', status: 'active', registeredDate: '2024-03-01', lastLogin: '2024-03-30' },
  ]

  const tabs = [
    { id: 'all', label: 'Tất cả', count: users.length },
    { id: 'admin', label: 'Admin', count: users.filter(u => u.role === 'admin').length },
    { id: 'user', label: 'Người Bán', count: users.filter(u => u.role === 'seller').length },
    { id: 'seller', label: 'Khách Hàng', count: users.filter(u => u.role === 'user').length },
    { id: 'active', label: 'Đang hoạt động', count: users.filter(u => u.status === 'active').length },
    { id: 'banned', label: 'Đã khóa', count: users.filter(u => u.status === 'banned').length },
  ]

  const filteredUsers = activeTab === 'all' 
    ? users 
    : activeTab === 'active'
    ? users.filter(u => u.status === 'active')
    : activeTab === 'banned'
    ? users.filter(u => u.status === 'banned')
    : activeTab === 'user'
    ? users.filter(u => u.role === 'seller')
    : activeTab === 'seller'
    ? users.filter(u => u.role === 'user')
    : users.filter(u => u.role === activeTab)

  const getRoleText = (role: string) => {
    const texts: Record<string, string> = {
      admin: 'Quản trị viên',
      user: 'Người dùng',
      seller: 'Người bán'
    }
    return texts[role] || role
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: '#8b5cf6',
      user: '#3b82f6',
      seller: '#f59e0b'
    }
    return colors[role] || '#6b7280'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#10b981',
      inactive: '#6b7280',
      banned: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      banned: 'Đã khóa'
    }
    return texts[status] || status
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedAll(checked)
    if (checked) {
      setSelectedItems(filteredUsers.map(u => u.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id))
      setSelectedAll(false)
    } else {
      const newSelected = [...selectedItems, id]
      setSelectedItems(newSelected)
      if (newSelected.length === filteredUsers.length) {
        setSelectedAll(true)
      }
    }
  }

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <div style={{ 
        padding: '24px 40px', 
        borderBottom: '1px solid #2a2f3e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0f1419'
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, letterSpacing: '1.2px' }}>QUẢN LÝ NGƯỜI DÙNG</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{ 
            width: '42px',
            height: '42px',
            background: '#1a1f2e',
            border: '1px solid #2a2f3e',
            borderRadius: '8px',
            color: '#8b92a7',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>⚙️</button>
          <button style={{ 
            width: '42px',
            height: '42px',
            background: '#1a1f2e',
            border: '1px solid #2a2f3e',
            borderRadius: '8px',
            color: '#8b92a7',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>🔔</button>
          <div style={{ position: 'relative' }}>
            <input 
              type="text"
              placeholder="Tìm kiếm người dùng..."
              style={{
                padding: '10px 18px 10px 42px',
                background: '#1a1f2e',
                border: '1px solid #2a2f3e',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                width: '240px'
              }}
            />
            <span style={{ 
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8b92a7',
              fontSize: '16px'
            }}>🔍</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 24px',
                background: activeTab === tab.id ? '#f97316' : '#1a1f2e',
                color: activeTab === tab.id ? 'white' : '#8b92a7',
                border: '1px solid #2a2f3e',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div style={{ background: '#1a1f2e', borderRadius: '8px', border: '1px solid #2a2f3e', overflow: 'hidden' }}>
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid #2a2f3e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>Danh sách Người Dùng</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select style={{
                padding: '8px 12px',
                background: '#0f1419',
                border: '1px solid #2a2f3e',
                borderRadius: '6px',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer'
              }}>
                <option>Sắp xếp: Mới nhất</option>
                <option>Cũ nhất</option>
                <option>Tên A-Z</option>
                <option>Tên Z-A</option>
              </select>
              <button style={{ 
                padding: '8px 18px', 
                background: '#f97316', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}>
                + Tạo Người Dùng
              </button>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            Hiện thị 1-{filteredUsers.length} trong {filteredUsers.length} kết quả
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1419', borderBottom: '1px solid #2a2f3e' }}>
                <th style={{ padding: '20px 28px', textAlign: 'left', width: '50px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                  />
                </th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>NGƯỜI DÙNG</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>EMAIL / SĐT</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>VAI TRÒ</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>NGÀY ĐĂNG KÝ</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '24px 28px' }}>
                    <input type="checkbox" checked={selectedItems.includes(user.id)} onChange={() => handleSelectItem(user.id)} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                  </td>
                  <td style={{ padding: '24px 28px' }}>
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
                      <div>
                        <div style={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>{user.name}</div>
                        <div style={{ color: '#6b7280', fontSize: '13px' }}>Đăng nhập: {user.lastLogin}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ color: '#8b92a7', fontSize: '14px', marginBottom: '4px' }}>{user.email}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{user.phone}</div>
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getRoleColor(user.role)}20`,
                      color: getRoleColor(user.role)
                    }}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getStatusColor(user.status)}20`,
                      color: getStatusColor(user.status)
                    }}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{user.registeredDate}</td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {user.status === 'active' && (
                        <button style={{ 
                          padding: '8px 16px', 
                          background: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500
                        }}>
                          Khóa
                        </button>
                      )}
                      {user.status === 'banned' && (
                        <button style={{ 
                          padding: '8px 16px', 
                          background: '#10b981', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500
                        }}>
                          Mở khóa
                        </button>
                      )}
                      <button style={{ 
                        padding: '8px 16px', 
                        background: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500
                      }}>
                        Chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UserManagement
