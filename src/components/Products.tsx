import { useState } from 'react'
import { useStore } from '../store/useStore'
import Header from './Header'

function Products() {
  const products = useStore((state) => state.products)
  const deleteProduct = useStore((state) => state.deleteProduct)

  const [selectedAll, setSelectedAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    description: ''
  })

  const [editProduct, setEditProduct] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    description: ''
  })

  const selectedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrice = (!priceRange.min || product.price >= Number(priceRange.min)) && (!priceRange.max || product.price <= Number(priceRange.max))
    return matchesCategory && matchesSearch && matchesPrice
  })

  const handleSelectAll = (checked: boolean) => {
    setSelectedAll(checked)
    if (checked) {
      setSelectedItems(filteredProducts.map(p => p.id))
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
      if (newSelected.length === filteredProducts.length) {
        setSelectedAll(true)
      }
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      deleteProduct(id)
    }
  }

  const handleViewDetail = (id: number) => {
    setSelectedProductId(id)
    setShowDetailModal(true)
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.category || !newProduct.price || !newProduct.stock) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    const addProduct = useStore.getState().addProduct
    const newId = Math.max(...products.map(p => p.id)) + 1
    
    addProduct({
      id: newId,
      name: newProduct.name,
      sku: newProduct.sku,
      category: newProduct.category,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
      sold: 0
    })

    setNewProduct({ name: '', sku: '', category: '', price: '', stock: '', description: '' })
    setShowAddModal(false)
    alert('Đã thêm sản phẩm thành công!')
  }

  const handleOpenEdit = () => {
    if (selectedProduct) {
      setEditProduct({
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        category: selectedProduct.category,
        price: selectedProduct.price.toString(),
        stock: selectedProduct.stock.toString(),
        description: ''
      })
      setShowDetailModal(false)
      setShowEditModal(true)
    }
  }

  const handleUpdateProduct = () => {
    if (!editProduct.name || !editProduct.sku || !editProduct.category || !editProduct.price || !editProduct.stock) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    if (selectedProductId) {
      const updateProduct = useStore.getState().updateProduct
      updateProduct(selectedProductId, {
        name: editProduct.name,
        sku: editProduct.sku,
        category: editProduct.category,
        price: Number(editProduct.price),
        stock: Number(editProduct.stock)
      })

      setShowEditModal(false)
      setSelectedProductId(null)
      alert('Đã cập nhật sản phẩm thành công!')
    }
  }

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header 
        title="DANH SÁCH SẢN PHẨM"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm sản phẩm..."
      />

      <div style={{ padding: '40px' }}>

        <div style={{ background: '#1a1f2e', padding: '28px', borderRadius: '10px', border: '1px solid #2a2f3e', marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '15px', color: '#e5e7eb', marginBottom: '6px', fontWeight: 500 }}>Tất cả Danh sách sản phẩm</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Lọc theo</div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '12px', color: '#8b92a7', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Tất cả danh mục</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                background: '#0f1419', 
                border: '1px solid #2a2f3e', 
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                cursor: 'pointer'
              }}>
              <option value="all">Tất cả danh mục</option>
              <option value="Laptop">Laptop</option>
              <option value="Điện thoại">Điện thoại</option>
              <option value="Máy tính bảng">Máy tính bảng</option>
              <option value="Phụ kiện">Phụ kiện</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '12px', color: '#8b92a7', fontWeight: 700, letterSpacing: '0.5px' }}>Giá Sản Phẩm</label>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Tối thiểu"
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                style={{ 
                  flex: 1,
                  padding: '12px 16px', 
                  background: '#0f1419', 
                  border: '1px solid #2a2f3e', 
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '15px'
                }}
              />
              <span style={{ color: '#8b92a7', fontSize: '15px' }}>-</span>
              <input 
                type="text" 
                placeholder="Tối đa"
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                style={{ 
                  flex: 1,
                  padding: '12px 16px', 
                  background: '#0f1419', 
                  border: '1px solid #2a2f3e', 
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '15px'
                }}
              />
            </div>
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
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: 'white', fontWeight: 500 }}>Tất cả Danh sách sản phẩm</div>
              {selectedItems.length > 0 && (
                <>
                  <div style={{ fontSize: '13px', color: '#8b92a7' }}>({selectedItems.length} đã chọn)</div>
                  <button 
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
                        selectedItems.forEach(id => deleteProduct(id))
                        setSelectedItems([])
                        setSelectedAll(false)
                        alert('Đã xóa các sản phẩm!')
                      }
                    }}
                    style={{ 
                      padding: '6px 14px', 
                      background: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    Xóa đã chọn
                  </button>
                  <button 
                    onClick={() => {
                      alert(`Xuất ${selectedItems.length} sản phẩm ra Excel`)
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
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#ea580c'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f97316'}
              >
                + Thêm sản phẩm
              </button>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                <option value="in_stock">Còn hàng</option>
                <option value="low_stock">Sắp hết</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            Hiện thị 1-{filteredProducts.length} trong {filteredProducts.length} kết quả
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1419', borderBottom: '1px solid #2a2f3e' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', width: '50px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                </th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>SẢN PHẨM</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>SKU</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>DANH MỤC</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>GIÁ BÁN</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>KHO</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>ĐÃ BÁN</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '24px 28px' }}>
                    <input type="checkbox" checked={selectedItems.includes(product.id)} onChange={() => handleSelectItem(product.id)} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                  </td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          background: '#2a2f3e', 
                          borderRadius: '14px',
                          objectFit: 'cover',
                          border: '2px solid #2a2f3e'
                        }}
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement
                          const fallback = img.nextElementSibling as HTMLElement
                          img.style.display = 'none'
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: '#2a2f3e', 
                        borderRadius: '14px',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                        border: '2px solid #2a2f3e'
                      }}>📦</div>
                      <span style={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>{product.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{product.sku}</td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{product.category}</td>
                  <td style={{ padding: '24px 28px', color: 'white', fontSize: '16px', fontWeight: 600 }}>{product.price.toLocaleString('vi-VN')} ₫</td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px', textAlign: 'center' }}>{product.stock}</td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px', textAlign: 'center' }}>{product.sold}</td>
                  <td style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{ 
                        padding: '6px 14px', 
                        borderRadius: '6px', 
                        fontSize: '13px',
                        fontWeight: 600,
                        background: product.stock > 10 ? '#10b98120' : product.stock > 5 ? '#f9731620' : '#ef444420',
                        color: product.stock > 10 ? '#10b981' : product.stock > 5 ? '#f97316' : '#ef4444'
                      }}>
                        {product.stock > 10 ? 'Còn hàng' : product.stock > 5 ? 'Sắp hết' : 'Hết hàng'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleViewDetail(product.id)}
                        style={{ 
                          padding: '10px 20px', 
                          background: '#3b82f6', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '7px', 
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 500,
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                      >
                        Chi tiết
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        style={{ 
                          padding: '10px 20px', 
                          background: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '7px', 
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 500,
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>Thêm Sản Phẩm Mới</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Tên sản phẩm</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên sản phẩm"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>SKU</label>
                <input 
                  type="text" 
                  placeholder="Nhập mã SKU"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Danh mục</label>
                <select 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
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
                  <option value="">Chọn danh mục</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Điện thoại">Điện thoại</option>
                  <option value="Máy tính bảng">Máy tính bảng</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Giá bán</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
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
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
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

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Mô tả</label>
                <textarea 
                  placeholder="Nhập mô tả sản phẩm" 
                  rows={4}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0f1419',
                    border: '1px solid #2a2f3e',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '15px',
                    resize: 'vertical'
                  }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
                    setNewProduct({ name: '', sku: '', category: '', price: '', stock: '', description: '' })
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#374151'}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleAddProduct}
                  style={{
                    padding: '12px 24px',
                    background: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#ea580c'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f97316'}
                >
                  Thêm Sản Phẩm
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetailModal && selectedProduct && (
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
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>Chi Tiết Sản Phẩm</h2>
              
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    background: '#2a2f3e', 
                    borderRadius: '12px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement
                    img.style.display = 'none'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: 'white' }}>{selectedProduct.name}</h3>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#8b92a7', fontSize: '14px' }}>SKU: </span>
                    <span style={{ color: 'white', fontSize: '14px' }}>{selectedProduct.sku}</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#8b92a7', fontSize: '14px' }}>Danh mục: </span>
                    <span style={{ color: 'white', fontSize: '14px' }}>{selectedProduct.category}</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#8b92a7', fontSize: '14px' }}>Giá: </span>
                    <span style={{ color: '#f97316', fontSize: '18px', fontWeight: 600 }}>{selectedProduct.price.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '16px',
                marginBottom: '24px',
                padding: '20px',
                background: '#0f1419',
                borderRadius: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{selectedProduct.stock}</div>
                  <div style={{ fontSize: '13px', color: '#8b92a7' }}>Tồn kho</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>{selectedProduct.sold}</div>
                  <div style={{ fontSize: '13px', color: '#8b92a7' }}>Đã bán</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>
                    {((selectedProduct.sold / (selectedProduct.sold + selectedProduct.stock)) * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '13px', color: '#8b92a7' }}>Tỷ lệ bán</div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '8px' }}>Trạng thái</div>
                <span style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  fontSize: '14px',
                  fontWeight: 600,
                  background: selectedProduct.stock > 10 ? '#10b98120' : selectedProduct.stock > 5 ? '#f9731620' : '#ef444420',
                  color: selectedProduct.stock > 10 ? '#10b981' : selectedProduct.stock > 5 ? '#f97316' : '#ef4444'
                }}>
                  {selectedProduct.stock > 10 ? 'Còn hàng' : selectedProduct.stock > 5 ? 'Sắp hết' : 'Hết hàng'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#374151'}
                >
                  Đóng
                </button>
                <button 
                  onClick={handleOpenEdit}
                  style={{
                    padding: '12px 24px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                >
                  Chỉnh Sửa
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedProduct && (
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
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>Chỉnh Sửa Sản Phẩm</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Tên sản phẩm</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên sản phẩm"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>SKU</label>
                <input 
                  type="text" 
                  placeholder="Nhập mã SKU"
                  value={editProduct.sku}
                  onChange={(e) => setEditProduct({...editProduct, sku: e.target.value})}
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Danh mục</label>
                <select 
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
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
                  <option value="">Chọn danh mục</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Điện thoại">Điện thoại</option>
                  <option value="Máy tính bảng">Máy tính bảng</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Giá bán</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
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
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({...editProduct, stock: e.target.value})}
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
                    setShowEditModal(false)
                    setEditProduct({ name: '', sku: '', category: '', price: '', stock: '', description: '' })
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#374151'}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleUpdateProduct}
                  style={{
                    padding: '12px 24px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
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

export default Products
