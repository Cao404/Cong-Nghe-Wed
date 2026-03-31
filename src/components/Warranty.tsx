import { useState } from 'react'

interface Dispute {
  id: number
  disputeCode: string
  orderCode: string
  customer: string
  seller: string
  type: 'refund' | 'return' | 'complaint' | 'warranty'
  reason: string
  amount: number
  status: 'pending' | 'investigating' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  createdDate: string
}

function Warranty() {
  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState('all')

  const disputes: Dispute[] = [
    { id: 1, disputeCode: 'DIS-001', orderCode: 'ORD-2024-001', customer: 'Nguyễn Văn A', seller: 'Shop Tech Pro', type: 'refund', reason: 'Sản phẩm không đúng mô tả', amount: 2500000, status: 'pending', priority: 'high', createdDate: '2024-03-25' },
    { id: 2, disputeCode: 'DIS-002', orderCode: 'ORD-2024-015', customer: 'Trần Thị B', seller: 'Shop Mobile', type: 'return', reason: 'Sản phẩm bị lỗi', amount: 3000000, status: 'investigating', priority: 'high', createdDate: '2024-03-24' },
    { id: 3, disputeCode: 'DIS-003', orderCode: 'ORD-2024-032', customer: 'Lê Văn C', seller: 'Shop Audio', type: 'warranty', reason: 'Yêu cầu bảo hành', amount: 1500000, status: 'resolved', priority: 'medium', createdDate: '2024-03-23' },
    { id: 4, disputeCode: 'DIS-004', orderCode: 'ORD-2024-048', customer: 'Phạm Thị D', seller: 'Shop Laptop', type: 'complaint', reason: 'Giao hàng chậm', amount: 4500000, status: 'investigating', priority: 'medium', createdDate: '2024-03-22' },
    { id: 5, disputeCode: 'DIS-005', orderCode: 'ORD-2024-056', customer: 'Hoàng Văn E', seller: 'Shop Accessories', type: 'refund', reason: 'Nhận sai sản phẩm', amount: 800000, status: 'resolved', priority: 'low', createdDate: '2024-03-21' },
    { id: 6, disputeCode: 'DIS-006', orderCode: 'ORD-2024-067', customer: 'Vũ Thị F', seller: 'Shop Gaming', type: 'return', reason: 'Đổi ý không mua', amount: 5200000, status: 'rejected', priority: 'low', createdDate: '2024-03-20' },
  ]

  const tabs = [
    { id: 'all', label: 'Tất cả', count: disputes.length },
    { id: 'pending', label: 'Chờ xử lý', count: disputes.filter(d => d.status === 'pending').length },
    { id: 'investigating', label: 'Đang xử lý', count: disputes.filter(d => d.status === 'investigating').length },
    { id: 'resolved', label: 'Đã giải quyết', count: disputes.filter(d => d.status === 'resolved').length },
    { id: 'rejected', label: 'Từ chối', count: disputes.filter(d => d.status === 'rejected').length },
  ]

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      refund: 'Hoàn tiền',
      return: 'Trả hàng',
      complaint: 'Khiếu nại',
      warranty: 'Bảo hành'
    }
    return texts[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      refund: '#f59e0b',
      return: '#3b82f6',
      complaint: '#ef4444',
      warranty: '#10b981'
    }
    return colors[type] || '#6b7280'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      investigating: '#3b82f6',
      resolved: '#10b981',
      rejected: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Chờ xử lý',
      investigating: 'Đang xử lý',
      resolved: 'Đã giải quyết',
      rejected: 'Từ chối'
    }
    return texts[status] || status
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    }
    return colors[priority] || '#6b7280'
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedAll(checked)
    if (checked) {
      setSelectedItems(disputes.map(d => d.id))
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
      if (newSelected.length === disputes.length) {
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
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, letterSpacing: '1.2px' }}>KHIẾU NẠI & TRANH CHẤP</h1>
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
            Hiện thị 1-{disputes.length} trong {disputes.length} kết quả
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
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>MÃ TRANH CHẤP</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>LOẠI</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>KHÁCH HÀNG</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>NGƯỜI BÁN</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>SỐ TIỀN</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>ƯU TIÊN</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((dispute) => (
                <tr key={dispute.id} style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '24px 28px' }}>
                    <input type="checkbox" checked={selectedItems.includes(dispute.id)} onChange={() => handleSelectItem(dispute.id)} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ color: '#3b82f6', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{dispute.disputeCode}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>Đơn: {dispute.orderCode}</div>
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getTypeColor(dispute.type)}20`,
                      color: getTypeColor(dispute.type)
                    }}>
                      {getTypeText(dispute.type)}
                    </span>
                  </td>
                  <td style={{ padding: '24px 28px', color: 'white', fontSize: '15px' }}>
                    {dispute.customer}
                  </td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>
                    {dispute.seller}
                  </td>
                  <td style={{ padding: '24px 28px', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                    {dispute.amount.toLocaleString('vi-VN')}₫
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: getPriorityColor(dispute.priority),
                      margin: '0 auto'
                    }}></div>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getStatusColor(dispute.status)}20`,
                      color: getStatusColor(dispute.status)
                    }}>
                      {getStatusText(dispute.status)}
                    </span>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
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
                      Xử lý
                    </button>
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

export default Warranty
