import { useEffect, useMemo, useState } from 'react'
import Header from './Header'
import { api } from '../api'
import { useStore } from '../store/useStore'

interface InventoryItem {
  id: number
  productName: string
  sku: string
  category: string
  stock: number
  reserved: number
  available: number
  minStock: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  lastUpdated: string
}

function Inventory() {
  const products = useStore((state) => state.products)
  const orders = useStore((state) => state.pendingOrders)
  const updateProduct = useStore((state) => state.updateProduct)

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [updateFormData, setUpdateFormData] = useState({ stock: 0, minStock: 0 })
  const [minStockOverrides, setMinStockOverrides] = useState<Record<number, number>>({})

  const itemsPerPage = 8

  const inventoryItems = useMemo<InventoryItem[]>(() => {
    const reservedByProductId = new Map<number, number>()
    const reservedByProductName = new Map<string, number>()

    for (const order of orders) {
      if (order.status !== 'pending') continue

      for (const item of order.items) {
        const qty = item.quantity || 0
        const productId = item.productId

        if (productId) {
          reservedByProductId.set(productId, (reservedByProductId.get(productId) ?? 0) + qty)
          continue
        }

        const key = (item.productName ?? '').toLowerCase()
        if (key) {
          reservedByProductName.set(key, (reservedByProductName.get(key) ?? 0) + qty)
        }
      }
    }

    return products.map((product) => {
      const reserved = reservedByProductId.get(product.id) ?? reservedByProductName.get(product.name.toLowerCase()) ?? 0
      const stock = product.stock
      const minStock = minStockOverrides[product.id] ?? Math.max(3, Math.ceil(stock * 0.2))
      const available = Math.max(0, stock - reserved)
      const status = stock === 0 ? 'out_of_stock' : stock <= minStock ? 'low_stock' : 'in_stock'

      return {
        id: product.id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        stock,
        reserved,
        available,
        minStock,
        status,
        lastUpdated: new Date().toISOString(),
      }
    })
  }, [minStockOverrides, orders, products])

  const categories = useMemo(() => ['all', ...Array.from(new Set(products.map((product) => product.category)))], [products])

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return inventoryItems.filter((item) => {
      const matchesSearch =
        !term ||
        item.productName.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [categoryFilter, inventoryItems, searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredItems.slice(startIndex, endIndex)
  const selectedItem = selectedItemId ? inventoryItems.find((item) => item.id === selectedItemId) ?? null : null

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, searchTerm, statusFilter])

  useEffect(() => {
    setSelectedItems((current) => current.filter((id) => filteredItems.some((item) => item.id === id)))
  }, [filteredItems])

  const stats = [
    { label: 'Tổng sản phẩm', value: filteredItems.length.toString(), icon: '📦', color: '#3b82f6' },
    { label: 'Còn hàng', value: filteredItems.filter((item) => item.status === 'in_stock').length.toString(), icon: '✅', color: '#10b981' },
    { label: 'Sắp hết', value: filteredItems.filter((item) => item.status === 'low_stock').length.toString(), icon: '⚠️', color: '#f59e0b' },
    { label: 'Hết hàng', value: filteredItems.filter((item) => item.status === 'out_of_stock').length.toString(), icon: '❌', color: '#ef4444' },
  ]

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? filteredItems.map((item) => item.id) : [])
  }

  const handleSelectItem = (id: number) => {
    setSelectedItems((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]))
  }

  const handleUpdateClick = (itemId: number) => {
    const item = inventoryItems.find((entry) => entry.id === itemId)
    if (!item) return

    setSelectedItemId(itemId)
    setUpdateFormData({
      stock: item.stock,
      minStock: item.minStock,
    })
    setShowUpdateModal(true)
  }

  const handleUpdateInventory = async () => {
    if (!selectedItemId) return

    const item = inventoryItems.find((entry) => entry.id === selectedItemId)
    if (!item) return

    try {
      const updated = await api.updateProduct(selectedItemId, {
        stock: updateFormData.stock,
      })

      updateProduct(selectedItemId, {
        stock: updated.stock,
        sold: updated.sold ?? item.available,
      })

      setMinStockOverrides((current) => ({
        ...current,
        [selectedItemId]: updateFormData.minStock,
      }))

      setShowUpdateModal(false)
      setSelectedItemId(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Cập nhật tồn kho thất bại')
    }
  }

  const handleExportExcel = () => {
    alert(`Xuất ${selectedItems.length} sản phẩm ra Excel`)
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      in_stock: 'Còn hàng',
      low_stock: 'Sắp hết',
      out_of_stock: 'Hết hàng',
    }
    return texts[status] || status
  }

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header
        title="QUẢN LÝ KHO HÀNG"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm sản phẩm, SKU, danh mục..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '30px' }}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: '#1a1f2e',
                padding: '28px',
                borderRadius: '12px',
                border: '1px solid #2a2f3e',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}
              >
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
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #2a2f3e',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '16px', color: 'white', fontWeight: 500 }}>Danh sách tồn kho</div>
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
                  }}
                >
                  Xuất Excel ({selectedItems.length} đã chọn)
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={filterStyle}>
                <option value="all">Tất cả danh mục</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock')}
                style={filterStyle}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="in_stock">Còn hàng</option>
                <option value="low_stock">Sắp hết</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>
          </div>

          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            Hiển thị {filteredItems.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredItems.length)} trong {filteredItems.length} kết quả
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1419', borderBottom: '1px solid #2a2f3e' }}>
                <th style={{ padding: '20px 28px', textAlign: 'left', width: '50px' }}>
                  <input
                    type="checkbox"
                    checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                  />
                </th>
                <th style={tableHeadStyle}>Sản phẩm</th>
                <th style={tableHeadStyle}>Danh mục</th>
                <th style={tableHeadStyle}>Tồn kho</th>
                <th style={tableHeadStyle}>Đã đặt</th>
                <th style={tableHeadStyle}>Khả dụng</th>
                <th style={tableHeadStyle}>Tối thiểu</th>
                <th style={tableHeadStyle}>Trạng thái</th>
                <th style={tableHeadStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#8b92a7' }}>
                    Không có sản phẩm phù hợp
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #2a2f3e' }}>
                    <td style={{ padding: '20px 28px' }}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                      />
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ color: 'white', fontWeight: 600 }}>{item.productName}</div>
                      <div style={{ color: '#6b7280', fontSize: '13px' }}>{item.sku}</div>
                    </td>
                    <td style={tableCellStyle}>{item.category}</td>
                    <td style={tableCellStyle}>{item.stock}</td>
                    <td style={tableCellStyle}>{item.reserved}</td>
                    <td style={tableCellStyle}>{item.available}</td>
                    <td style={tableCellStyle}>{item.minStock}</td>
                    <td style={tableCellStyle}>
                      <span style={statusBadgeStyle(item.status)}>{getStatusText(item.status)}</span>
                    </td>
                    <td style={tableCellStyle}>
                      <button onClick={() => handleUpdateClick(item.id)} style={actionButtonStyle}>
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={paginationStyle}>
            <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} style={pagerButtonStyle(currentPage === 1)}>
              ← Trước
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} style={pageButtonStyle(currentPage === page)}>
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={pagerButtonStyle(currentPage === totalPages)}
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {showUpdateModal && selectedItem && (
        <div style={overlayStyle} onClick={() => setShowUpdateModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Cập nhật tồn kho</h2>
              <button onClick={() => setShowUpdateModal(false)} style={closeButtonStyle}>
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Sản phẩm</label>
                <div style={readonlyFieldStyle}>{selectedItem.productName}</div>
              </div>
              <div style={formGridStyle}>
                <div>
                  <label style={labelStyle}>Tồn kho</label>
                  <input
                    type="number"
                    value={updateFormData.stock}
                    onChange={(e) => setUpdateFormData((current) => ({ ...current, stock: Number(e.target.value) }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tối thiểu</label>
                  <input
                    type="number"
                    value={updateFormData.minStock}
                    onChange={(e) => setUpdateFormData((current) => ({ ...current, minStock: Number(e.target.value) }))}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowUpdateModal(false)} style={secondaryButtonStyle}>
                  Hủy
                </button>
                <button onClick={() => void handleUpdateInventory()} style={primaryButtonStyle}>
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const filterStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: '#0f1419',
  color: 'white',
  border: '1px solid #2a2f3e',
  borderRadius: '8px',
  fontSize: '14px',
}

const tableHeadStyle: React.CSSProperties = {
  padding: '20px 28px',
  textAlign: 'left',
  color: '#8b92a7',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
}

const tableCellStyle: React.CSSProperties = {
  padding: '20px 28px',
  color: '#cbd5e1',
}

const statusBadgeStyle = (status: string): React.CSSProperties => ({
  padding: '6px 12px',
  borderRadius: '999px',
  background: `${getStatusColorMap(status)}20`,
  color: getStatusColorMap(status),
  fontWeight: 700,
  fontSize: '13px',
})

function getStatusColorMap(status: string) {
  const colors: Record<string, string> = {
    in_stock: '#10b981',
    low_stock: '#f59e0b',
    out_of_stock: '#ef4444',
  }
  return colors[status] || '#6b7280'
}

const actionButtonStyle: React.CSSProperties = {
  padding: '8px 14px',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
}

const paginationStyle: React.CSSProperties = {
  padding: '24px 0 0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
}

const pagerButtonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  background: disabled ? '#1a1f2e' : '#2a2f3e',
  color: disabled ? '#6b7280' : 'white',
  border: '1px solid #2a2f3e',
  borderRadius: '6px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '14px',
})

const pageButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  background: active ? '#f97316' : '#2a2f3e',
  color: 'white',
  border: '1px solid #2a2f3e',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  minWidth: '40px',
})

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 1000,
}

const modalStyle: React.CSSProperties = {
  width: 'min(100%, 520px)',
  background: '#1a1f2e',
  border: '1px solid #2a2f3e',
  borderRadius: '16px',
  padding: '24px',
}

const closeButtonStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  border: '1px solid #2a2f3e',
  background: '#0f1419',
  color: 'white',
  cursor: 'pointer',
  fontSize: '20px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  color: '#8b92a7',
  fontSize: '13px',
  fontWeight: 600,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: '#0f1419',
  border: '1px solid #2a2f3e',
  borderRadius: '10px',
  color: 'white',
}

const readonlyFieldStyle: React.CSSProperties = {
  padding: '12px 14px',
  background: '#0f1419',
  border: '1px solid #2a2f3e',
  borderRadius: '10px',
  color: 'white',
}

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '12px',
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '12px 18px',
  background: '#2a2f3e',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '12px 18px',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
}

export default Inventory
