import { useState } from 'react'
import Header from './Header'

interface ShippingPartner {
  id: number
  name: string
  code: string
  logo: string
  type: 'express' | 'standard' | 'economy'
  status: 'active' | 'inactive'
  totalOrders: number
  successRate: number
  avgDeliveryTime: number
  fee: number
  contact: string
}

function Shipping() {
  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const allPartners: ShippingPartner[] = [
    { id: 1, name: 'Giao Hàng Nhanh', code: 'GHN', logo: '🚚', type: 'express', status: 'active', totalOrders: 1234, successRate: 98.5, avgDeliveryTime: 2.5, fee: 25000, contact: '1900-1234' },
    { id: 2, name: 'Giao Hàng Tiết Kiệm', code: 'GHTK', logo: '📦', type: 'economy', status: 'active', totalOrders: 987, successRate: 97.2, avgDeliveryTime: 3.5, fee: 18000, contact: '1900-5678' },
    { id: 3, name: 'Viettel Post', code: 'VTP', logo: '✉️', type: 'standard', status: 'active', totalOrders: 756, successRate: 96.8, avgDeliveryTime: 3, fee: 22000, contact: '1900-8888' },
    { id: 4, name: 'VN Post', code: 'VNP', logo: '📮', type: 'standard', status: 'active', totalOrders: 543, successRate: 95.5, avgDeliveryTime: 4, fee: 20000, contact: '1900-5454' },
    { id: 5, name: 'J&T Express', code: 'JT', logo: '🚛', type: 'express', status: 'active', totalOrders: 892, successRate: 97.8, avgDeliveryTime: 2.8, fee: 23000, contact: '1900-1088' },
    { id: 6, name: 'Ninja Van', code: 'NINJA', logo: '🥷', type: 'express', status: 'inactive', totalOrders: 234, successRate: 94.2, avgDeliveryTime: 3.2, fee: 24000, contact: '1900-6886' },
  ]

  const partners = allPartners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      express: 'Nhanh',
      standard: 'Tiêu chuẩn',
      economy: 'Tiết kiệm'
    }
    return texts[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      express: '#ef4444',
      standard: '#3b82f6',
      economy: '#10b981'
    }
    return colors[type] || '#6b7280'
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#10b981' : '#6b7280'
  }

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Hoạt động' : 'Tạm dừng'
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedAll(checked)
    if (checked) {
      setSelectedItems(partners.map(p => p.id))
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
      if (newSelected.length === partners.length) {
        setSelectedAll(true)
      }
    }
  }

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header 
        title="VẬN CHUYỂN & ĐỐI TÁC"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm đối tác..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ background: '#1a1f2e', padding: '32px', borderRadius: '12px', border: '1px solid #2a2f3e', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Đối Tác Vận Chuyển</h2>
          <div style={{ 
            padding: '60px', 
            textAlign: 'center', 
            border: '2px dashed #2a2f3e', 
            borderRadius: '12px',
            background: '#0f1419'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚚</div>
            <div style={{ fontSize: '16px', color: '#8b92a7', marginBottom: '24px' }}>Thêm đối tác vận chuyển mới</div>
            <button style={{ 
              padding: '12px 32px', 
              background: '#f97316', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
            }}>
              Thêm Đối Tác
            </button>
          </div>
        </div>

        <div style={{ background: '#1a1f2e', borderRadius: '8px', border: '1px solid #2a2f3e', overflow: 'hidden' }}>
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid #2a2f3e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>Danh sách Đối Tác</div>
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
                <option>Tất cả loại</option>
                <option>Nhanh</option>
                <option>Tiêu chuẩn</option>
                <option>Tiết kiệm</option>
              </select>
              <select style={{
                padding: '8px 12px',
                background: '#0f1419',
                border: '1px solid #2a2f3e',
                borderRadius: '6px',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer'
              }}>
                <option>Tất cả trạng thái</option>
                <option>Hoạt động</option>
                <option>Tạm dừng</option>
              </select>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            Hiện thị 1-{partners.length} trong {partners.length} kết quả
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
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>ĐỐI TÁC</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>LOẠI HÌNH</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TỔNG ĐƠN</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TỶ LỆ THÀNH CÔNG</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THỜI GIAN GIAO</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>PHÍ SHIP</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id} style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '24px 28px' }}>
                    <input type="checkbox" checked={selectedItems.includes(partner.id)} onChange={() => handleSelectItem(partner.id)} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ 
                        width: '56px', 
                        height: '56px', 
                        borderRadius: '12px', 
                        background: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px'
                      }}>{partner.logo}</div>
                      <div>
                        <div style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>{partner.name}</div>
                        <div style={{ color: '#6b7280', fontSize: '13px' }}>Mã: {partner.code} • {partner.contact}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getTypeColor(partner.type)}20`,
                      color: getTypeColor(partner.type)
                    }}>
                      {getTypeText(partner.type)}
                    </span>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                    {partner.totalOrders.toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                      {partner.successRate}%
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '6px', 
                      background: '#2a2f3e', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${partner.successRate}%`, 
                        height: '100%', 
                        background: partner.successRate >= 97 ? '#10b981' : partner.successRate >= 95 ? '#f59e0b' : '#ef4444',
                        transition: 'width 0.3s'
                      }}></div>
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                    {partner.avgDeliveryTime} ngày
                  </td>
                  <td style={{ padding: '24px 28px', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                    {partner.fee.toLocaleString('vi-VN')}₫
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getStatusColor(partner.status)}20`,
                      color: getStatusColor(partner.status)
                    }}>
                      {getStatusText(partner.status)}
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
                        Cấu hình
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

export default Shipping
