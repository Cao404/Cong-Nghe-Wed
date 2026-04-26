import { useState } from 'react'
import '../styles/header.css'

interface Notification {
  id: number
  title: string
  message: string
  time: string
  type: 'order' | 'user' | 'product' | 'system'
  read: boolean
}

interface HeaderProps {
  title: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

function Header({ title, searchValue = '', onSearchChange, searchPlaceholder = 'Tìm kiếm...' }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Đơn hàng mới', message: 'Bạn có 3 đơn hàng mới cần xử lý', time: '5 phút trước', type: 'order', read: false },
    { id: 2, title: 'Người dùng mới', message: 'Có 2 người dùng mới đăng ký', time: '1 giờ trước', type: 'user', read: false },
    { id: 3, title: 'Sản phẩm sắp hết', message: 'iPhone 15 Pro còn 3 sản phẩm', time: '2 giờ trước', type: 'product', read: true },
    { id: 4, title: 'Cập nhật hệ thống', message: 'Hệ thống đã được cập nhật phiên bản mới', time: '1 ngày trước', type: 'system', read: true },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const getNotificationLabel = (type: string) => {
    const labels: Record<string, string> = {
      order: 'ĐH',
      user: 'ND',
      product: 'SP',
      system: 'HT',
    }
    return labels[type] || 'TB'
  }

  return (
    <div className="header-bar" style={{
        padding: '24px 40px',
        borderBottom: '1px solid #2a2f3e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0f1419',
      }}>
      <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, letterSpacing: '0.4px', color: 'white' }}>{title}</h1>

      <div className="header-bar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          style={{
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
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#232d3f')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1f2e')}
        >
          Cài
        </button>

        <div className="header-bar__notifications" style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
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
              fontSize: '13px',
              fontWeight: 600,
              position: 'relative',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#232d3f')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1f2e')}
          >
            TB
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '18px',
                  height: '18px',
                  background: '#334155',
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999,
                }}
                onClick={() => setShowNotifications(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: 0,
                  width: '380px',
                  maxHeight: '500px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Thông báo</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {unreadCount > 0 ? `${unreadCount} thông báo mới` : 'Không có thông báo mới'}
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      style={{
                        padding: '6px 12px',
                        background: '#f8fafc',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280' }}>
                      <div style={{ fontSize: '14px' }}>Không có thông báo</div>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleMarkAsRead(notification.id)}
                        style={{
                          padding: '16px 20px',
                          borderBottom: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          background: notification.read ? '#ffffff' : '#f8fafc',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = notification.read ? '#ffffff' : '#f8fafc')}
                      >
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div
                            style={{
                              minWidth: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              background: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#334155',
                              flexShrink: 0,
                            }}
                          >
                            {getNotificationLabel(notification.type)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '4px',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '14px',
                                  fontWeight: notification.read ? 400 : 600,
                                  color: notification.read ? '#64748b' : '#0f172a',
                                }}
                              >
                                {notification.title}
                              </div>
                              {!notification.read && (
                                <div
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#ef4444',
                                    flexShrink: 0,
                                    marginTop: '4px',
                                  }}
                                />
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                marginBottom: '6px',
                                lineHeight: '1.4',
                              }}
                            >
                              {notification.message}
                            </div>
                            <div style={{ fontSize: '12px', color: '#4b5563' }}>{notification.time}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {onSearchChange && (
          <div className="header-bar__search" style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                padding: '10px 18px 10px 18px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#0f172a',
                fontSize: '15px',
                width: '240px',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#94a3b8'
                e.currentTarget.style.width = '280px'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1'
                e.currentTarget.style.width = '240px'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
