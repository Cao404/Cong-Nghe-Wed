import { useState } from 'react'

interface ContentItem {
  id: number
  type: 'product' | 'review' | 'seller' | 'image'
  title: string
  submittedBy: string
  submittedDate: string
  status: 'pending' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  category: string
}

function Audit() {
  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState('all')

  const items: ContentItem[] = [
    { id: 1, type: 'product', title: 'Laptop Gaming ROG Strix G15', submittedBy: 'Shop Tech Pro', submittedDate: '2024-03-25', status: 'pending', priority: 'high', category: 'Laptop' },
    { id: 2, type: 'review', title: 'Đánh giá sản phẩm iPhone 15 Pro', submittedBy: 'Nguyễn Văn A', submittedDate: '2024-03-24', status: 'pending', priority: 'medium', category: 'Điện thoại' },
    { id: 3, type: 'seller', title: 'Cửa hàng điện tử ABC', submittedBy: 'Trần Thị B', submittedDate: '2024-03-23', status: 'approved', priority: 'high', category: 'Điện tử' },
    { id: 4, type: 'image', title: 'Hình ảnh sản phẩm MacBook Pro', submittedBy: 'Shop Apple Store', submittedDate: '2024-03-22', status: 'pending', priority: 'low', category: 'Laptop' },
    { id: 5, type: 'product', title: 'Tai nghe Sony WH-1000XM5', submittedBy: 'Shop Audio Pro', submittedDate: '2024-03-21', status: 'approved', priority: 'medium', category: 'Phụ kiện' },
    { id: 6, type: 'review', title: 'Đánh giá Samsung Galaxy S24', submittedBy: 'Lê Văn C', submittedDate: '2024-03-20', status: 'rejected', priority: 'low', category: 'Điện thoại' },
  ]

  const tabs = [
    { id: 'all', label: 'Tất cả', count: items.length },
    { id: 'pending', label: 'Chờ duyệt', count: items.filter(i => i.status === 'pending').length },
    { id: 'approved', label: 'Đã duyệt', count: items.filter(i => i.status === 'approved').length },
    { id: 'rejected', label: 'Từ chối', count: items.filter(i => i.status === 'rejected').length },
  ]

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      product: 'Sản phẩm',
      review: 'Đánh giá',
      seller: 'Người bán',
      image: 'Hình ảnh'
    }
    return texts[type] || type
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      product: '📦',
      review: '⭐',
      seller: '🏪',
      image: '🖼️'
    }
    return icons[type] || '📄'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    }
    return colors[priority] || '#6b7280'
  }

  const getPriorityText = (priority: string) => {
    const texts: Record<string, string> = {
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp'
    }
    return texts[priority] || priority
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối'
    }
    return texts[status] || status
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedAll(checked)
    if (checked) {
      setSelectedItems(items.map(i => i.id))
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
      if (newSelected.length === items.length) {
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
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, letterSpacing: '1.2px' }}>KIỂM DUYỆT NỘI DUNG</h1>
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
              placeholder="Tìm kiếm..."
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
        <div style={{ background: '#1a1f2e', borderRadius: '8px', border: '1px solid #2a2f3e', overflow: 'hidden' }}>
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid #2a2f3e',
            overflowX: 'auto'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '18px 28px',
                  background: activeTab === tab.id ? '#0f1419' : 'transparent',
                  color: activeTab === tab.id ? '#3b82f6' : '#8b92a7',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            Hiện thị 1-{items.length} trong {items.length} kết quả
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
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>LOẠI</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>NỘI DUNG</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>NGƯỜI GỬI</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>NGÀY GỬI</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>ƯU TIÊN</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '24px 28px' }}>
                    <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{getTypeIcon(item.type)}</span>
                      <span style={{ color: '#8b92a7', fontSize: '15px' }}>{getTypeText(item.type)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{item.category}</div>
                  </td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>
                    {item.submittedBy}
                  </td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>
                    {new Date(item.submittedDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getPriorityColor(item.priority)}20`,
                      color: getPriorityColor(item.priority)
                    }}>
                      {getPriorityText(item.priority)}
                    </span>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getStatusColor(item.status)}20`,
                      color: getStatusColor(item.status)
                    }}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {item.status === 'pending' && (
                        <>
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
                            Duyệt
                          </button>
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
                            Từ chối
                          </button>
                        </>
                      )}
                      {item.status !== 'pending' && (
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
                      )}
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

export default Audit
