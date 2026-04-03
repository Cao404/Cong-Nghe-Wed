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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const [vouchers, setVouchers] = useState<Voucher[]>([
    { id: 1, code: 'SUMMER2024', name: 'Giảm giá mùa hè', type: 'percentage', value: 20, minOrder: 500000, maxDiscount: 100000, quantity: 100, used: 45, startDate: '2024-06-01', endDate: '2024-08-31', status: 'active' },
    { id: 2, code: 'FREESHIP50K', name: 'Miễn phí vận chuyển', type: 'fixed', value: 50000, minOrder: 200000, maxDiscount: 50000, quantity: 200, used: 156, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active' },
    { id: 3, code: 'NEWUSER100K', name: 'Khách hàng mới', type: 'fixed', value: 100000, minOrder: 300000, maxDiscount: 100000, quantity: 500, used: 234, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active' },
    { id: 4, code: 'FLASH30', name: 'Flash Sale 30%', type: 'percentage', value: 30, minOrder: 1000000, maxDiscount: 300000, quantity: 50, used: 50, startDate: '2024-03-01', endDate: '2024-03-15', status: 'expired' },
    { id: 5, code: 'VIP15', name: 'Ưu đãi VIP', type: 'percentage', value: 15, minOrder: 2000000, maxDiscount: 500000, quantity: 30, used: 12, startDate: '2024-03-01', endDate: '2024-06-30', status: 'active' },
    { id: 6, code: 'WEEKEND200K', name: 'Cuối tuần vui vẻ', type: 'fixed', value: 200000, minOrder: 1500000, maxDiscount: 200000, quantity: 100, used: 67, startDate: '2024-03-01', endDate: '2024-04-30', status: 'active' },
  ])

  const [newVoucher, setNewVoucher] = useState({
    code: '',
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrder: '',
    maxDiscount: '',
    quantity: '',
    startDate: '',
    endDate: ''
  })

  const [editVoucher, setEditVoucher] = useState({
    code: '',
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minOrder: '',
    maxDiscount: '',
    quantity: '',
    startDate: '',
    endDate: ''
  })

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || voucher.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVouchers = filteredVouchers.slice(startIndex, endIndex)

  const selectedVoucher = selectedVoucherId ? vouchers.find(v => v.id === selectedVoucherId) : null

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
      setSelectedItems(currentVouchers.map(v => v.id))
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
      if (newSelected.length === currentVouchers.length) {
        setSelectedAll(true)
      }
    }
  }

  const handleAddVoucher = () => {
    if (!newVoucher.code || !newVoucher.name || !newVoucher.value || !newVoucher.minOrder || !newVoucher.maxDiscount || !newVoucher.quantity || !newVoucher.startDate || !newVoucher.endDate) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    const newId = Math.max(...vouchers.map(v => v.id)) + 1
    setVouchers([...vouchers, {
      id: newId,
      code: newVoucher.code.toUpperCase(),
      name: newVoucher.name,
      type: newVoucher.type,
      value: Number(newVoucher.value),
      minOrder: Number(newVoucher.minOrder),
      maxDiscount: Number(newVoucher.maxDiscount),
      quantity: Number(newVoucher.quantity),
      used: 0,
      startDate: newVoucher.startDate,
      endDate: newVoucher.endDate,
      status: 'active'
    }])

    setNewVoucher({ code: '', name: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', quantity: '', startDate: '', endDate: '' })
    setShowAddModal(false)
    alert('Đã tạo voucher thành công!')
  }

  const handleOpenEdit = (voucher: Voucher) => {
    setSelectedVoucherId(voucher.id)
    setEditVoucher({
      code: voucher.code,
      name: voucher.name,
      type: voucher.type,
      value: voucher.value.toString(),
      minOrder: voucher.minOrder.toString(),
      maxDiscount: voucher.maxDiscount.toString(),
      quantity: voucher.quantity.toString(),
      startDate: voucher.startDate,
      endDate: voucher.endDate
    })
    setShowEditModal(true)
  }

  const handleUpdateVoucher = () => {
    if (!editVoucher.code || !editVoucher.name || !editVoucher.value || !editVoucher.minOrder || !editVoucher.maxDiscount || !editVoucher.quantity || !editVoucher.startDate || !editVoucher.endDate) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    if (selectedVoucherId) {
      setVouchers(vouchers.map(v => 
        v.id === selectedVoucherId ? {
          ...v,
          code: editVoucher.code.toUpperCase(),
          name: editVoucher.name,
          type: editVoucher.type,
          value: Number(editVoucher.value),
          minOrder: Number(editVoucher.minOrder),
          maxDiscount: Number(editVoucher.maxDiscount),
          quantity: Number(editVoucher.quantity),
          startDate: editVoucher.startDate,
          endDate: editVoucher.endDate
        } : v
      ))

      setShowEditModal(false)
      setSelectedVoucherId(null)
      alert('Đã cập nhật voucher thành công!')
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa voucher này?')) {
      setVouchers(vouchers.filter(v => v.id !== id))
      alert('Đã xóa voucher!')
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
            <button 
              onClick={() => setShowAddModal(true)}
              style={{ 
                padding: '12px 32px', 
                background: '#f97316', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
              }}
            >
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
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'expired')}
                style={{
                  padding: '8px 12px',
                  background: '#0f1419',
                  border: '1px solid #2a2f3e',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
                <option value="expired">Hết hạn</option>
              </select>
              <button 
                onClick={() => setShowAddModal(true)}
                style={{ 
                  padding: '8px 18px', 
                  background: '#f97316', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                + Tạo Voucher Mới
              </button>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            Hiện thị {startIndex + 1}-{Math.min(endIndex, filteredVouchers.length)} trong {filteredVouchers.length} kết quả
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
              {currentVouchers.map((voucher) => (
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
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleOpenEdit(voucher)}
                        style={{ 
                          padding: '8px 16px', 
                          background: '#3b82f6', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(voucher.id)}
                        style={{ 
                          padding: '8px 16px', 
                          background: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              padding: '20px 24px', 
              borderTop: '1px solid #2a2f3e',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  background: currentPage === 1 ? '#1a1f2e' : '#2a2f3e',
                  color: currentPage === 1 ? '#6b7280' : 'white',
                  border: '1px solid #2a2f3e',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                ← Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 14px',
                    background: currentPage === page ? '#f97316' : '#2a2f3e',
                    color: 'white',
                    border: '1px solid #2a2f3e',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: currentPage === page ? 600 : 500,
                    minWidth: '40px'
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  background: currentPage === totalPages ? '#1a1f2e' : '#2a2f3e',
                  color: currentPage === totalPages ? '#6b7280' : 'white',
                  border: '1px solid #2a2f3e',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Sau →
              </button>
            </div>
          )}
        </div>

        {/* Modal Tạo Voucher */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowAddModal(false)}
          >
            <div style={{
              background: '#1a1f2e',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #2a2f3e',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>Tạo Voucher Mới</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Mã voucher</label>
                <input 
                  type="text" 
                  placeholder="VD: SUMMER2024"
                  value={newVoucher.code}
                  onChange={(e) => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f1419',
                    border: '1px solid #2a2f3e',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px',
                    textTransform: 'uppercase'
                  }} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Tên chương trình</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên chương trình"
                  value={newVoucher.name}
                  onChange={(e) => setNewVoucher({...newVoucher, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f1419',
                    border: '1px solid #2a2f3e',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px'
                  }} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Loại giảm giá</label>
                <select 
                  value={newVoucher.type}
                  onChange={(e) => setNewVoucher({...newVoucher, type: e.target.value as 'percentage' | 'fixed'})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f1419',
                    border: '1px solid #2a2f3e',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}>
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Cố định (₫)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>
                    Giá trị {newVoucher.type === 'percentage' ? '(%)' : '(₫)'}
                  </label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newVoucher.value}
                    onChange={(e) => setNewVoucher({...newVoucher, value: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Giảm tối đa (₫)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newVoucher.maxDiscount}
                    onChange={(e) => setNewVoucher({...newVoucher, maxDiscount: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Đơn tối thiểu (₫)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newVoucher.minOrder}
                    onChange={(e) => setNewVoucher({...newVoucher, minOrder: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Số lượng</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newVoucher.quantity}
                    onChange={(e) => setNewVoucher({...newVoucher, quantity: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    value={newVoucher.startDate}
                    onChange={(e) => setNewVoucher({...newVoucher, startDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Ngày kết thúc</label>
                  <input 
                    type="date" 
                    value={newVoucher.endDate}
                    onChange={(e) => setNewVoucher({...newVoucher, endDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
                    setNewVoucher({ code: '', name: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', quantity: '', startDate: '', endDate: '' })
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500
                  }}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleAddVoucher}
                  style={{
                    padding: '12px 24px',
                    background: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500
                  }}
                >
                  Tạo Voucher
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Sửa Voucher */}
        {showEditModal && selectedVoucher && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowEditModal(false)}
          >
            <div style={{
              background: '#1a1f2e',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #2a2f3e',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>Chỉnh Sửa Voucher</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Mã voucher</label>
                <input 
                  type="text" 
                  value={editVoucher.code}
                  onChange={(e) => setEditVoucher({...editVoucher, code: e.target.value.toUpperCase()})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f1419',
                    border: '1px solid #2a2f3e',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px',
                    textTransform: 'uppercase'
                  }} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Tên chương trình</label>
                <input 
                  type="text" 
                  value={editVoucher.name}
                  onChange={(e) => setEditVoucher({...editVoucher, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f1419',
                    border: '1px solid #2a2f3e',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px'
                  }} 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Loại giảm giá</label>
                <select 
                  value={editVoucher.type}
                  onChange={(e) => setEditVoucher({...editVoucher, type: e.target.value as 'percentage' | 'fixed'})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f1419',
                    border: '1px solid #2a2f3e',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}>
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Cố định (₫)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>
                    Giá trị {editVoucher.type === 'percentage' ? '(%)' : '(₫)'}
                  </label>
                  <input 
                    type="number" 
                    value={editVoucher.value}
                    onChange={(e) => setEditVoucher({...editVoucher, value: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Giảm tối đa (₫)</label>
                  <input 
                    type="number" 
                    value={editVoucher.maxDiscount}
                    onChange={(e) => setEditVoucher({...editVoucher, maxDiscount: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Đơn tối thiểu (₫)</label>
                  <input 
                    type="number" 
                    value={editVoucher.minOrder}
                    onChange={(e) => setEditVoucher({...editVoucher, minOrder: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Số lượng</label>
                  <input 
                    type="number" 
                    value={editVoucher.quantity}
                    onChange={(e) => setEditVoucher({...editVoucher, quantity: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    value={editVoucher.startDate}
                    onChange={(e) => setEditVoucher({...editVoucher, startDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Ngày kết thúc</label>
                  <input 
                    type="date" 
                    value={editVoucher.endDate}
                    onChange={(e) => setEditVoucher({...editVoucher, endDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px'
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500
                  }}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleUpdateVoucher}
                  style={{
                    padding: '12px 24px',
                    background: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500
                  }}
                >
                  Cập Nhật
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Promo
