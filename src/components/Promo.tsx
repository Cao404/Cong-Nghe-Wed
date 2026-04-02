import { useState } from 'react'
import Header from './Header'

interface Voucher {
  id: number
  code: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder: number
  maxDiscount: number
  quantity: number
  used: number
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'expired'
}

function Promo() {
  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const allVouchers: Voucher[] = [
    { id: 1, code: 'SUMMER2024', name: 'Giảm giá mùa hè', type: 'percentage', value: 20, minOrder: 500000, maxDiscount: 100000, quantity: 100, used: 45, startDate: '2024-06-01', endDate: '2024-08-31', status: 'active' },
    { id: 2, code: 'FREESHIP50K', name: 'Miễn phí vận chuyển', type: 'fixed', value: 50000, minOrder: 200000, maxDiscount: 50000, quantity: 200, used: 156, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active' },
    { id: 3, code: 'NEWUSER100K', name: 'Khách hàng mới', type: 'fixed', value: 100000, minOrder: 300000, maxDiscount: 100000, quantity: 500, used: 234, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active' },
    { id: 4, code: 'FLASH30', name: 'Flash Sale 30%', type: 'percentage', value: 30, minOrder: 1000000, maxDiscount: 300000, quantity: 50, used: 50, startDate: '2024-03-01', endDate: '2024-03-15', status: 'expired' },
    { id: 5, code: 'VIP15', name: 'Ưu đãi VIP', type: 'percentage', value: 15, minOrder: 2000000, maxDiscount: 500000, quantity: 30, used: 12, startDate: '2024-03-01', endDate: '2024-06-30', status: 'active' },
    { id: 6, code: 'WEEKEND200K', name: 'Cuối tuần vui vẻ', type: 'fixed', value: 200000, minOrder: 1500000, maxDiscount: 200000, quantity: 100, used: 67, startDate: '2024-03-01', endDate: '2024-04-30', status: 'active' },
  ]

  const vouchers = allVouchers.filter(voucher =>
    voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#10b981',
      inactive: '#6b7280',
      expired: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: 'Đang hoạt động',
      inactive: 'Tạm dừng',
      expired: 'Hết hạn'
    }
    return texts[status] || status
  }

  const getTypeText = (type: string) => {
    return type === 'percentage' ? 'Phần trăm' : 'Cố định'
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedAll(checked)
    if (checked) {
      setSelectedItems(vouchers.map(v => v.id))
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
      if (newSelected.length === vouchers.length) {
        setSelectedAll(true)
      }
    }
  }

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header 
        title="KHUYẾN MÃI & CHÍNH SÁCH"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm voucher..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ background: '#1a1f2e', padding: '32px', borderRadius: '12px', border: '1px solid #2a2f3e', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Voucher Nền Tảng</h2>
          <div style={{ 
            padding: '60px', 
            textAlign: 'center', 
            border: '2px dashed #2a2f3e', 
            borderRadius: '12px',
            background: '#0f1419'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎟️</div>
            <div style={{ fontSize: '16px', color: '#8b92a7', marginBottom: '24px' }}>Chưa có voucher nào</div>
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
              Tạo Voucher
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
            <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>Danh sách Voucher</div>
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
                <option>Tất cả trạng thái</option>
                <option>Đang hoạt động</option>
                <option>Tạm dừng</option>
                <option>Hết hạn</option>
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
                + Tạo Voucher Mới
              </button>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            Hiện thị 1-{vouchers.length} trong {vouchers.length} kết quả
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
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>MÃ VOUCHER</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TÊN CHƯƠNG TRÌNH</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>GIẢM GIÁ</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>SỐ LƯỢNG</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THỜI GIAN</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher.id} style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '24px 28px' }}>
                    <input type="checkbox" checked={selectedItems.includes(voucher.id)} onChange={() => handleSelectItem(voucher.id)} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ 
                      padding: '8px 16px', 
                      background: '#f9731620', 
                      border: '2px dashed #f97316',
                      borderRadius: '8px',
                      display: 'inline-block'
                    }}>
                      <div style={{ color: '#f97316', fontSize: '16px', fontWeight: 700, fontFamily: 'monospace' }}>{voucher.code}</div>
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>{voucher.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>Đơn tối thiểu: {voucher.minOrder.toLocaleString('vi-VN')}₫</div>
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {voucher.type === 'percentage' ? `${voucher.value}%` : `${voucher.value.toLocaleString('vi-VN')}₫`}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>
                      {getTypeText(voucher.type)} • Tối đa {voucher.maxDiscount.toLocaleString('vi-VN')}₫
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {voucher.used}/{voucher.quantity}
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '6px', 
                      background: '#2a2f3e', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${(voucher.used / voucher.quantity) * 100}%`, 
                        height: '100%', 
                        background: voucher.used === voucher.quantity ? '#ef4444' : '#10b981',
                        transition: 'width 0.3s'
                      }}></div>
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ color: '#8b92a7', fontSize: '14px', marginBottom: '4px' }}>Từ: {voucher.startDate}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>Đến: {voucher.endDate}</div>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      fontSize: '13px',
                      fontWeight: 600,
                      background: `${getStatusColor(voucher.status)}20`,
                      color: getStatusColor(voucher.status)
                    }}>
                      {getStatusText(voucher.status)}
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
                        Sửa
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
                        Xóa
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

export default Promo
