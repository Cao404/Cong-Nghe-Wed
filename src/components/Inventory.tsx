import { useState } from 'react'
import Header from './Header'

interface InventoryItem {
  id: number
  productName: string
  sku: string
  warehouse: string
  stock: number
  reserved: number
  available: number
  minStock: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  lastUpdated: string
}

function Inventory() {
  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    { id: 1, productName: 'iPhone 15 Pro', sku: 'SKU-0001', warehouse: 'Kho Hà Nội', stock: 45, reserved: 8, available: 37, minStock: 10, status: 'in_stock', lastUpdated: '2024-03-25' },
    { id: 2, productName: 'Samsung Galaxy S24', sku: 'SKU-0002', warehouse: 'Kho TP.HCM', stock: 12, reserved: 5, available: 7, minStock: 15, status: 'low_stock', lastUpdated: '2024-03-24' },
    { id: 3, productName: 'MacBook Pro M3', sku: 'SKU-0003', warehouse: 'Kho Hà Nội', stock: 0, reserved: 0, available: 0, minStock: 5, status: 'out_of_stock', lastUpdated: '2024-03-23' },
    { id: 4, productName: 'iPad Pro', sku: 'SKU-0004', warehouse: 'Kho Đà Nẵng', stock: 28, reserved: 3, available: 25, minStock: 10, status: 'in_stock', lastUpdated: '2024-03-25' },
    { id: 5, productName: 'AirPods Pro', sku: 'SKU-0005', warehouse: 'Kho TP.HCM', stock: 8, reserved: 2, available: 6, minStock: 20, status: 'low_stock', lastUpdated: '2024-03-24' },
    { id: 6, productName: 'Apple Watch Series 9', sku: 'SKU-0006', warehouse: 'Kho Hà Nội', stock: 35, reserved: 7, available: 28, minStock: 15, status: 'in_stock', lastUpdated: '2024-03-25' },
    { id: 7, productName: 'Sony WH-1000XM5', sku: 'SKU-0007', warehouse: 'Kho TP.HCM', stock: 22, reserved: 4, available: 18, minStock: 10, status: 'in_stock', lastUpdated: '2024-03-25' },
    { id: 8, productName: 'Dell XPS 15', sku: 'SKU-0008', warehouse: 'Kho Hà Nội', stock: 6, reserved: 2, available: 4, minStock: 8, status: 'low_stock', lastUpdated: '2024-03-24' },
    { id: 9, productName: 'LG OLED TV 55"', sku: 'SKU-0009', warehouse: 'Kho Đà Nẵng', stock: 15, reserved: 1, available: 14, minStock: 5, status: 'in_stock', lastUpdated: '2024-03-25' },
    { id: 10, productName: 'Canon EOS R6', sku: 'SKU-0010', warehouse: 'Kho TP.HCM', stock: 0, reserved: 0, available: 0, minStock: 3, status: 'out_of_stock', lastUpdated: '2024-03-22' },
  ])
  const [updateFormData, setUpdateFormData] = useState({
    stock: 0,
    reserved: 0,
    minStock: 0
  })

  const items = inventoryItems.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesWarehouse = warehouseFilter === 'all' || item.warehouse === warehouseFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    
    return matchesSearch && matchesWarehouse && matchesStatus
  })

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)

  const stats = [
    { label: 'Tổng Sản Phẩm', value: items.length.toString(), icon: '📦', color: '#3b82f6' },
    { label: 'Còn Hàng', value: items.filter(i => i.status === 'in_stock').length.toString(), icon: '✅', color: '#10b981' },
    { label: 'Sắp Hết', value: items.filter(i => i.status === 'low_stock').length.toString(), icon: '⚠️', color: '#f59e0b' },
    { label: 'Hết Hàng', value: items.filter(i => i.status === 'out_of_stock').length.toString(), icon: '❌', color: '#ef4444' },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_stock: '#10b981',
      low_stock: '#f59e0b',
      out_of_stock: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      in_stock: 'Còn hàng',
      low_stock: 'Sắp hết',
      out_of_stock: 'Hết hàng'
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

  const handleUpdateClick = (itemId: number) => {
    const item = inventoryItems.find(i => i.id === itemId)
    if (item) {
      setSelectedItemId(itemId)
      setUpdateFormData({
        stock: item.stock,
        reserved: item.reserved,
        minStock: item.minStock
      })
      setShowUpdateModal(true)
    }
  }

  const handleUpdateInventory = () => {
    if (selectedItemId) {
      setInventoryItems(inventoryItems.map(item => {
        if (item.id === selectedItemId) {
          const available = updateFormData.stock - updateFormData.reserved
          let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
          
          if (updateFormData.stock === 0) {
            status = 'out_of_stock'
          } else if (updateFormData.stock <= updateFormData.minStock) {
            status = 'low_stock'
          }
          
          return {
            ...item,
            stock: updateFormData.stock,
            reserved: updateFormData.reserved,
            available: available,
            minStock: updateFormData.minStock,
            status: status,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        }
        return item
      }))
      setShowUpdateModal(false)
      setSelectedItemId(null)
    }
  }

  const handleExportExcel = () => {
    alert(`Xuất ${selectedItems.length} sản phẩm ra Excel`)
  }

  const selectedItem = selectedItemId ? inventoryItems.find(i => i.id === selectedItemId) : null

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header 
        title="QUẢN LÝ KHO HÀNG"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm sản phẩm..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '30px' }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ 
              background: '#1a1f2e', 
              padding: '28px', 
              borderRadius: '12px',
              border: '1px solid #2a2f3e',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '12px', 
                background: `${stat.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: '#8b92a7' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#1a1f2e', borderRadius: '8px', border: '1px solid #2a2f3e', overflow: 'hidden' }}>
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid #2a2f3e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>Danh sách Tồn Kho</div>
              {selectedItems.length > 0 && (
                <button
                  onClick={handleExportExcel}
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
                  Xuất Excel ({selectedItems.length} đã chọn)
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select 
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  padding: '8px 12px',
                  background: '#0f1419',
                  border: '1px solid #2a2f3e',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tất cả kho</option>
                <option value="Kho Hà Nội">Kho Hà Nội</option>
                <option value="Kho TP.HCM">Kho TP.HCM</option>
                <option value="Kho Đà Nẵng">Kho Đà Nẵng</option>
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  padding: '8px 12px',
                  background: '#0f1419',
                  border: '1px solid #2a2f3e',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="in_stock">Còn hàng</option>
                <option value="low_stock">Sắp hết</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            Hiện thị {startIndex + 1}-{Math.min(endIndex, items.length)} trong {items.length} kết quả
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
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>SẢN PHẨM</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>KHO</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TỒN KHO</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>ĐÃ ĐẶT</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>KHẢ DỤNG</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TỐI THIỂU</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '24px 28px' }}>
                    <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>{item.productName}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{item.sku}</div>
                  </td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>
                    {item.warehouse}
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center', color: 'white', fontSize: '16px', fontWeight: 600 }}>
                    {item.stock}
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center', color: '#f59e0b', fontSize: '16px', fontWeight: 600 }}>
                    {item.reserved}
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center', color: '#10b981', fontSize: '16px', fontWeight: 600 }}>
                    {item.available}
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '15px' }}>
                    {item.minStock}
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
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
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleUpdateClick(item.id)}
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
                      Cập nhật
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
      </div>

      {showUpdateModal && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1f2e',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid #2a2f3e'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #2a2f3e',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: 'white' }}>Cập Nhật Tồn Kho</h2>
              <button
                onClick={() => setShowUpdateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ color: 'white', fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                  {selectedItem.productName}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                  {selectedItem.sku} • {selectedItem.warehouse}
                </div>
                <div style={{ 
                  display: 'inline-block',
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '13px',
                  fontWeight: 600,
                  background: `${getStatusColor(selectedItem.status)}20`,
                  color: getStatusColor(selectedItem.status)
                }}>
                  {getStatusText(selectedItem.status)}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8b92a7', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tồn Kho
                </label>
                <input
                  type="number"
                  value={updateFormData.stock}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, stock: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f1419',
                    border: '1px solid #2a2f3e',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '15px'
                  }}
                  min="0"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8b92a7', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Đã Đặt (Reserved)
                </label>
                <input
                  type="number"
                  value={updateFormData.reserved}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, reserved: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f1419',
                    border: '1px solid #2a2f3e',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '15px'
                  }}
                  min="0"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8b92a7', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tồn Kho Tối Thiểu
                </label>
                <input
                  type="number"
                  value={updateFormData.minStock}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, minStock: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f1419',
                    border: '1px solid #2a2f3e',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '15px'
                  }}
                  min="0"
                />
              </div>

              <div style={{ 
                padding: '16px', 
                background: '#0f1419', 
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #2a2f3e'
              }}>
                <div style={{ color: '#8b92a7', fontSize: '13px', marginBottom: '8px' }}>Thông tin tính toán:</div>
                <div style={{ color: 'white', fontSize: '15px' }}>
                  Khả dụng: <span style={{ color: '#10b981', fontWeight: 600 }}>
                    {updateFormData.stock - updateFormData.reserved}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#2a2f3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#2a2f3e'}
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateInventory}
                  style={{
                    padding: '12px 24px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
