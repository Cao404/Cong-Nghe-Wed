import { useState } from 'react'
import Header from './Header'

interface Dispute {
  id: number
  disputeCode: string
  orderCode: string
  customer: string
  shop: string
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
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const [disputes, setDisputes] = useState<Dispute[]>([
    { id: 1, disputeCode: 'DIS-001', orderCode: 'ORD-2024-001', customer: 'Nguyễn Văn A', shop: 'Shop Tech Pro', type: 'refund', reason: 'Sản phẩm không đúng mô tả', amount: 2500000, status: 'pending', priority: 'high', createdDate: '2024-03-25' },
    { id: 2, disputeCode: 'DIS-002', orderCode: 'ORD-2024-015', customer: 'Trần Thị B', shop: 'Shop Mobile', type: 'return', reason: 'Sản phẩm bị lỗi', amount: 3000000, status: 'investigating', priority: 'high', createdDate: '2024-03-24' },
    { id: 3, disputeCode: 'DIS-003', orderCode: 'ORD-2024-032', customer: 'Lê Văn C', shop: 'Shop Audio', type: 'warranty', reason: 'Yêu cầu bảo hành', amount: 1500000, status: 'resolved', priority: 'medium', createdDate: '2024-03-23' },
    { id: 4, disputeCode: 'DIS-004', orderCode: 'ORD-2024-048', customer: 'Phạm Thị D', shop: 'Shop Laptop', type: 'complaint', reason: 'Giao hàng chậm', amount: 4500000, status: 'investigating', priority: 'medium', createdDate: '2024-03-22' },
    { id: 5, disputeCode: 'DIS-005', orderCode: 'ORD-2024-056', customer: 'Hoàng Văn E', shop: 'Shop Accessories', type: 'refund', reason: 'Nhận sai sản phẩm', amount: 800000, status: 'resolved', priority: 'low', createdDate: '2024-03-21' },
    { id: 6, disputeCode: 'DIS-006', orderCode: 'ORD-2024-067', customer: 'Vũ Thị F', shop: 'Shop Gaming', type: 'return', reason: 'Đổi ý không mua', amount: 5200000, status: 'rejected', priority: 'low', createdDate: '2024-03-20' },
  ])

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.disputeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.shop.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'all' || dispute.status === activeTab
    return matchesSearch && matchesTab
  })

  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDisputes = filteredDisputes.slice(startIndex, endIndex)

  const selectedDispute = selectedDisputeId ? disputes.find(d => d.id === selectedDisputeId) : null

  const tabs = [
    { id: 'all', label: 'Tất cả', count: filteredDisputes.length },
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
      setSelectedItems(currentDisputes.map(d => d.id))
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
      if (newSelected.length === currentDisputes.length) {
        setSelectedAll(true)
      }
    }
  }

  const handleViewDetail = (dispute: Dispute) => {
    setSelectedDisputeId(dispute.id)
    setShowDetailModal(true)
  }

  const handleUpdateStatus = (status: 'investigating' | 'resolved' | 'rejected') => {
    if (selectedDisputeId) {
      setDisputes(disputes.map(d => 
        d.id === selectedDisputeId ? { ...d, status } : d
      ))
      setShowDetailModal(false)
      setSelectedDisputeId(null)
      alert(`Đã cập nhật trạng thái thành "${getStatusText(status)}"!`)
    }
  }

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header 
        title="KHIẾU NẠI & TRANH CHẤP"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm tranh chấp..."
      />

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
            Hiện thị {startIndex + 1}-{Math.min(endIndex, filteredDisputes.length)} trong {filteredDisputes.length} kết quả
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
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>CỬA HÀNG</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>SỐ TIỀN</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>ƯU TIÊN</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {currentDisputes.map((dispute) => (
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
                    {dispute.shop}
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
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleViewDetail(dispute)}
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
                      Xử lý
                    </button>
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

        {/* Modal Chi Tiết Tranh Chấp */}
        {showDetailModal && selectedDispute && (
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
          onClick={() => setShowDetailModal(false)}
          >
            <div style={{
              background: '#1a1f2e',
              padding: '32px',
              borderRadius: '12px',
              border: '1px solid #2a2f3e',
              maxWidth: '600px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>Chi Tiết Tranh Chấp</h2>
              
              <div style={{ marginBottom: '20px', padding: '16px', background: '#0f1419', borderRadius: '8px', border: '1px solid #2a2f3e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '4px' }}>Mã tranh chấp</div>
                    <div style={{ fontSize: '18px', color: '#3b82f6', fontWeight: 600 }}>{selectedDispute.disputeCode}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '4px' }}>Mã đơn hàng</div>
                    <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>{selectedDispute.orderCode}</div>
                  </div>
                </div>
                <div style={{ 
                  padding: '8px 12px', 
                  background: `${getTypeColor(selectedDispute.type)}20`,
                  color: getTypeColor(selectedDispute.type),
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'inline-block'
                }}>
                  {getTypeText(selectedDispute.type)}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '6px' }}>Khách hàng</div>
                <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>{selectedDispute.customer}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '6px' }}>Cửa hàng</div>
                <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>{selectedDispute.shop}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '6px' }}>Lý do</div>
                <div style={{ fontSize: '15px', color: 'white' }}>{selectedDispute.reason}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '6px' }}>Số tiền</div>
                <div style={{ fontSize: '24px', color: '#f97316', fontWeight: 700 }}>{selectedDispute.amount.toLocaleString('vi-VN')}₫</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '6px' }}>Ngày tạo</div>
                <div style={{ fontSize: '15px', color: 'white' }}>{selectedDispute.createdDate}</div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '6px' }}>Trạng thái hiện tại</div>
                <span style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  fontWeight: 600,
                  background: `${getStatusColor(selectedDispute.status)}20`,
                  color: getStatusColor(selectedDispute.status),
                  display: 'inline-block'
                }}>
                  {getStatusText(selectedDispute.status)}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #2a2f3e', paddingTop: '20px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '12px', fontWeight: 600 }}>Cập nhật trạng thái:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleUpdateStatus('investigating')}
                    disabled={selectedDispute.status === 'investigating'}
                    style={{
                      padding: '10px 16px',
                      background: selectedDispute.status === 'investigating' ? '#374151' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: selectedDispute.status === 'investigating' ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      opacity: selectedDispute.status === 'investigating' ? 0.5 : 1
                    }}
                  >
                    Đang xử lý
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('resolved')}
                    disabled={selectedDispute.status === 'resolved'}
                    style={{
                      padding: '10px 16px',
                      background: selectedDispute.status === 'resolved' ? '#374151' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: selectedDispute.status === 'resolved' ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      opacity: selectedDispute.status === 'resolved' ? 0.5 : 1
                    }}
                  >
                    Đã giải quyết
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={selectedDispute.status === 'rejected'}
                    style={{
                      padding: '10px 16px',
                      background: selectedDispute.status === 'rejected' ? '#374151' : '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: selectedDispute.status === 'rejected' ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      opacity: selectedDispute.status === 'rejected' ? 0.5 : 1
                    }}
                  >
                    Từ chối
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #2a2f3e' }}>
                <button 
                  onClick={() => setShowDetailModal(false)}
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
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Warranty
