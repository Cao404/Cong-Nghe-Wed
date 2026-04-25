import { useState } from 'react'
import '../styles/nguoi-dung.css'

interface Seller {
  id: number
  name: string
  email: string
  phone: string
  kyc: 'verified' | 'pending' | 'rejected'
  status: 'active' | 'pending' | 'rejected' | 'banned'
  registeredDate: string
  shopName: string
}

function Users() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'temporary' | 'banned'>('all')
  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [sellers, setSellers] = useState<Seller[]>([
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@shop.vn', phone: '0901234567', kyc: 'verified', status: 'active', registeredDate: '2024-01-15', shopName: 'Shop Điện Tử A' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@shop.vn', phone: '0912345678', kyc: 'pending', status: 'pending', registeredDate: '2024-02-20', shopName: 'Shop Thời Trang B' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@shop.vn', phone: '0923456789', kyc: 'verified', status: 'active', registeredDate: '2024-01-10', shopName: 'Shop Phụ Kiện C' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@shop.vn', phone: '0934567890', kyc: 'rejected', status: 'rejected', registeredDate: '2024-03-05', shopName: 'Shop Mỹ Phẩm D' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@shop.vn', phone: '0945678901', kyc: 'pending', status: 'pending', registeredDate: '2024-03-15', shopName: 'Shop Giày Dép E' },
    { id: 6, name: 'Vũ Thị F', email: 'vuthif@shop.vn', phone: '0956789012', kyc: 'verified', status: 'active', registeredDate: '2024-02-01', shopName: 'Shop Đồ Gia Dụng F' },
  ])

  const handleApprove = (id: number) => {
    if (confirm('Bạn có chắc muốn duyệt người bán này?')) {
      setSellers(sellers.map(s => s.id === id ? { ...s, status: 'active' as const } : s))
      alert('Đã duyệt người bán thành công!')
    }
  }

  const handleReject = (id: number) => {
    const reason = prompt('Nhập lý do từ chối:')
    if (reason) {
      setSellers(sellers.map(s => s.id === id ? { ...s, status: 'rejected' as const } : s))
      alert('Đã từ chối người bán!')
    }
  }

  const handleViewDetail = (seller: Seller) => {
    alert(`Chi tiết người bán:\n\nTên: ${seller.name}\nShop: ${seller.shopName}\nEmail: ${seller.email}\nSĐT: ${seller.phone}\nKYC: ${getKycText(seller.kyc)}\nTrạng thái: ${getStatusText(seller.status)}\nNgày đăng ký: ${seller.registeredDate}`)
  }

  const tabs = [
    { id: 'all', label: 'Tất cả', count: sellers.length },
    { id: 'pending', label: 'Đang chờ', count: sellers.filter(s => s.status === 'pending').length },
    { id: 'approved', label: 'Đã duyệt', count: sellers.filter(s => s.status === 'active').length },
    { id: 'rejected', label: 'Từ chối', count: sellers.filter(s => s.status === 'rejected').length },
    { id: 'temporary', label: 'Tạm ngưng', count: 0 },
    { id: 'banned', label: 'Đã khóa', count: 0 },
  ]

  const filteredSellers = activeTab === 'all' 
    ? sellers 
    : activeTab === 'approved'
    ? sellers.filter(s => s.status === 'active')
    : sellers.filter(s => s.status === activeTab)

  const handleSelectAll = (checked: boolean) => {
    setSelectedAll(checked)
    if (checked) {
      setSelectedItems(filteredSellers.map(s => s.id))
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
      if (newSelected.length === filteredSellers.length) {
        setSelectedAll(true)
      }
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#10b981',
      pending: '#f59e0b',
      rejected: '#ef4444',
      banned: '#6b7280'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      active: 'Hoạt động',
      pending: 'Chờ duyệt',
      rejected: 'Từ chối',
      banned: 'Đã khóa'
    }
    return texts[status] || status
  }

  const getKycText = (kyc: string) => {
    const texts: Record<string, string> = {
      verified: 'Đã xác minh',
      pending: 'Chờ xác minh',
      rejected: 'Từ chối'
    }
    return texts[kyc] || kyc
  }

  return (
    <div className="nguoi-dung-page">
      <div className="nguoi-dung-page__header" style={{ 
        padding: '24px 40px', 
        borderBottom: '1px solid #2a2f3e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0f1419'
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, letterSpacing: '1.2px' }}>DUYỆT NGƯỜI BÁN</h1>
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
              placeholder="Tìm kiếm người bán..."
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

      <div className="nguoi-dung-page__content">
        <div className="nguoi-dung-page__tabs">
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

        <div className="nguoi-dung-page__panel">
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid #2a2f3e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>Danh sách Người Bán</div>
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
          </div>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            {filteredSellers.length === 0 ? 'Không có kết quả' : `Hiện thị 1-${filteredSellers.length} trong ${filteredSellers.length} kết quả`}
          </div>

          {filteredSellers.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <div style={{ fontSize: '16px' }}>Không có dữ liệu</div>
            </div>
          ) : (
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
                  <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>NGƯỜI BÁN</th>
                  <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>EMAIL / SĐT</th>
                  <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>KYC</th>
                  <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>NGÀY ĐĂNG KÝ</th>
                  <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '24px 28px' }}>
                      <input type="checkbox" checked={selectedItems.includes(seller.id)} onChange={() => handleSelectItem(seller.id)} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
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
                          <div style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>{seller.name}</div>
                          <div style={{ color: '#8b92a7', fontSize: '13px' }}>{seller.shopName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px 28px' }}>
                      <div style={{ color: '#8b92a7', fontSize: '14px', marginBottom: '4px' }}>{seller.email}</div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>{seller.phone}</div>
                    </td>
                    <td style={{ padding: '24px 28px' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        fontSize: '13px',
                        fontWeight: 600,
                        background: seller.kyc === 'verified' ? '#10b98120' : seller.kyc === 'pending' ? '#f59e0b20' : '#ef444420',
                        color: seller.kyc === 'verified' ? '#10b981' : seller.kyc === 'pending' ? '#f59e0b' : '#ef4444'
                      }}>
                        {getKycText(seller.kyc)}
                      </span>
                    </td>
                    <td style={{ padding: '24px 28px' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        fontSize: '13px',
                        fontWeight: 600,
                        background: `${getStatusColor(seller.status)}20`,
                        color: getStatusColor(seller.status)
                      }}>
                        {getStatusText(seller.status)}
                      </span>
                    </td>
                    <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{seller.registeredDate}</td>
                    <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {seller.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(seller.id)}
                              style={{ 
                                padding: '8px 16px', 
                                background: '#10b981', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                            >
                              Duyệt
                            </button>
                            <button 
                              onClick={() => handleReject(seller.id)}
                              style={{ 
                                padding: '8px 16px', 
                                background: '#ef4444', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleViewDetail(seller)}
                          style={{ 
                            padding: '8px 16px', 
                            background: '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Users
