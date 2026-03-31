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

  const allItems: InventoryItem[] = [
    { id: 1, productName: 'iPhone 15 Pro', sku: 'SKU-0001', warehouse: 'Kho Hà Nội', stock: 45, reserved: 8, available: 37, minStock: 10, status: 'in_stock', lastUpdated: '2024-03-25' },
    { id: 2, productName: 'Samsung Galaxy S24', sku: 'SKU-0002', warehouse: 'Kho TP.HCM', stock: 12, reserved: 5, available: 7, minStock: 15, status: 'low_stock', lastUpdated: '2024-03-24' },
    { id: 3, productName: 'MacBook Pro M3', sku: 'SKU-0003', warehouse: 'Kho Hà Nội', stock: 0, reserved: 0, available: 0, minStock: 5, status: 'out_of_stock', lastUpdated: '2024-03-23' },
    { id: 4, productName: 'iPad Pro', sku: 'SKU-0004', warehouse: 'Kho Đà Nẵng', stock: 28, reserved: 3, available: 25, minStock: 10, status: 'in_stock', lastUpdated: '2024-03-25' },
    { id: 5, productName: 'AirPods Pro', sku: 'SKU-0005', warehouse: 'Kho TP.HCM', stock: 8, reserved: 2, available: 6, minStock: 20, status: 'low_stock', lastUpdated: '2024-03-24' },
    { id: 6, productName: 'Apple Watch Series 9', sku: 'SKU-0006', warehouse: 'Kho Hà Nội', stock: 35, reserved: 7, available: 28, minStock: 15, status: 'in_stock', lastUpdated: '2024-03-25' },
  ]

  const items = allItems.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>Danh sách Tồn Kho</div>
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
                <option>Tất cả kho</option>
                <option>Kho Hà Nội</option>
                <option>Kho TP.HCM</option>
                <option>Kho Đà Nẵng</option>
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
                <option>Còn hàng</option>
                <option>Sắp hết</option>
                <option>Hết hàng</option>
              </select>
            </div>
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
              {items.map((item) => (
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
                      Cập nhật
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

export default Inventory
