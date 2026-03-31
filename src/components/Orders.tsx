import { useState } from 'react'
import Header from './Header'

interface Order {
  id: number
  orderCode: string
  customer: string
  products: number
  total: number
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  paymentMethod: string
  date: string
  shippingPartner?: string
}

function Orders() {
  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const allOrders: Order[] = [
    { id: 1, orderCode: 'ORD-2024-001', customer: 'Nguyễn Văn A', products: 3, total: 2500000, status: 'delivered', paymentMethod: 'COD', date: '2024-03-15', shippingPartner: 'GHN' },
    { id: 2, orderCode: 'ORD-2024-002', customer: 'Trần Thị B', products: 1, total: 3000000, status: 'shipping', paymentMethod: 'Chuyển khoản', date: '2024-03-20', shippingPartner: 'GHTK' },
    { id: 3, orderCode: 'ORD-2024-003', customer: 'Lê Văn C', products: 2, total: 1800000, status: 'confirmed', paymentMethod: 'Ví điện tử', date: '2024-03-22' },
    { id: 4, orderCode: 'ORD-2024-004', customer: 'Phạm Thị D', products: 5, total: 4500000, status: 'pending', paymentMethod: 'COD', date: '2024-03-25' },
    { id: 5, orderCode: 'ORD-2024-005', customer: 'Hoàng Văn E', products: 1, total: 2800000, status: 'delivered', paymentMethod: 'Chuyển khoản', date: '2024-03-26', shippingPartner: 'VTP' },
    { id: 6, orderCode: 'ORD-2024-006', customer: 'Vũ Thị F', products: 4, total: 3200000, status: 'cancelled', paymentMethod: 'COD', date: '2024-03-28' },
  ]

  const orders = allOrders.filter(order => 
    order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'all', label: 'Tất cả', count: orders.length },
    { id: 'pending', label: 'Chờ xác nhận', count: orders.filter(o => o.status === 'pending').length },
    { id: 'confirmed', label: 'Đã xác nhận', count: orders.filter(o => o.status === 'confirmed').length },
    { id: 'shipping', label: 'Đang giao', count: orders.filter(o => o.status === 'shipping').length },
    { id: 'delivered', label: 'Đã giao', count: orders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status === 'cancelled').length },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      shipping: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    }
    return texts[status] || status
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedAll(checked)
    if (checked) {
      setSelectedItems(orders.map(o => o.id))
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
      if (newSelected.length === orders.length) {
        setSelectedAll(true)
      }
    }
  }

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header 
        title="QUẢN LÝ ĐƠN HÀNG"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm đơn hàng..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ background: '#1a1f2e', borderRadius: '8px', border: '1px solid #2a2f3e', overflow: 'hidden' }}>
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid #2a2f3e',
            overflowX: 'auto',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex' }}>
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
            {selectedItems.length > 0 && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '0 24px' }}>
                <div style={{ fontSize: '13px', color: '#8b92a7' }}>({selectedItems.length} đã chọn)</div>
                <button 
                  onClick={() => {
                    alert(`In ${selectedItems.length} đơn hàng`)
                    setSelectedItems([])
                    setSelectedAll(false)
                  }}
                  style={{ 
                    padding: '6px 14px', 
                    background: '#3b82f6', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  In đơn hàng
                </button>
                <button 
                  onClick={() => {
                    alert(`Xuất ${selectedItems.length} đơn hàng`)
                    setSelectedItems([])
                    setSelectedAll(false)
                  }}
                  style={{ 
                    padding: '6px 14px', 
                    background: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  Xuất Excel
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            Hiện thị 1-{orders.length} trong {orders.length} kết quả
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
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>MÃ ĐƠN</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>KHÁCH HÀNG</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>SẢN PHẨM</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TỔNG TIỀN</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THANH TOÁN</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>NGÀY ĐẶT</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '24px 28px' }}>
                    <input type="checkbox" checked={selectedItems.includes(order.id)} onChange={() => handleSelectItem(order.id)} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ color: '#3b82f6', fontSize: '15px', fontWeight: 600 }}>{order.orderCode}</div>
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>{order.customer}</div>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                    {order.products}
                  </td>
                  <td style={{ padding: '24px 28px', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                    {order.total.toLocaleString('vi-VN')}₫
                  </td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>
                    {order.paymentMethod}
                  </td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>
                    {new Date(order.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status)
                    }}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
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

export default Orders
