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
    <div className="header-bar">
      <h1 className="header-bar__title">{title}</h1>

      <div className="header-bar__actions">
        <button
          className="header-bar__icon-button"
          onMouseEnter={(e) => (e.currentTarget.style.background = '#232d3f')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1f2e')}
        >
          Cài
        </button>

        <div className="header-bar__notifications">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="header-bar__notifications-button"
            onMouseEnter={(e) => (e.currentTarget.style.background = '#232d3f')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1f2e')}
          >
            TB
            {unreadCount > 0 && (
              <span className="header-bar__badge">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="header-bar__overlay"
                onClick={() => setShowNotifications(false)}
              />
              <div
                className="header-bar__dropdown"
              >
                <div
                  className="header-bar__dropdown-header"
                >
                  <div>
                    <div className="header-bar__dropdown-title">Thông báo</div>
                    <div className="header-bar__dropdown-subtitle">
                      {unreadCount > 0 ? `${unreadCount} thông báo mới` : 'Không có thông báo mới'}
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="header-bar__mark-all"
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>

                <div className="header-bar__dropdown-list">
                  {notifications.length === 0 ? (
                    <div className="header-bar__empty">
                      <div className="header-bar__empty-text">Không có thông báo</div>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleMarkAsRead(notification.id)}
                        className={`header-bar__notification-item ${notification.read ? 'header-bar__notification-item--read' : 'header-bar__notification-item--unread'}`}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = notification.read ? '#ffffff' : '#f8fafc')}
                      >
                        <div className="header-bar__notification-row">
                          <div className="header-bar__notification-type">
                            {getNotificationLabel(notification.type)}
                          </div>
                          <div className="header-bar__notification-body">
                            <div className="header-bar__notification-heading">
                              <div className={notification.read ? 'header-bar__notification-title header-bar__notification-title--read' : 'header-bar__notification-title header-bar__notification-title--unread'}>
                                {notification.title}
                              </div>
                              {!notification.read && (
                                <div className="header-bar__notification-dot" />
                              )}
                            </div>
                            <div className="header-bar__notification-message">
                              {notification.message}
                            </div>
                            <div className="header-bar__notification-time">{notification.time}</div>
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
          <div className="header-bar__search">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="header-bar__search-input"
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
