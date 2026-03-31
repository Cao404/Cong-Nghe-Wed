import { useState } from 'react'
import { useStore } from '../store/useStore'
import Header from './Header'

interface Category {
  id: number
  name: string
  description: string
  productCount: number
  parentCategory: string
  status: 'active' | 'inactive'
}

function Category() {
  const categories = useStore((state) => state.categories)
  const setCategories = useStore((state) => state.setCategories)
  const addCategory = useStore((state) => state.addCategory)
  const updateCategory = useStore((state) => state.updateCategory)
  const deleteCategory = useStore((state) => state.deleteCategory)

  const [selectedAll, setSelectedAll] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parentCategory: '',
    isNewParent: false,
    newParentName: ''
  })

  const [editCategory, setEditCategory] = useState({
    name: '',
    description: '',
    parentCategory: '',
    isNewParent: false,
    newParentName: ''
  })

  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null
  
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || cat.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    setSelectedAll(checked)
    if (checked) {
      setSelectedItems(filteredCategories.map(c => c.id))
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
      if (newSelected.length === filteredCategories.length) {
        setSelectedAll(true)
      }
    }
  }

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.description) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    if (newCategory.isNewParent && !newCategory.newParentName) {
      alert('Vui lòng nhập tên danh mục cha mới!')
      return
    }

    if (!newCategory.isNewParent && !newCategory.parentCategory) {
      alert('Vui lòng chọn danh mục cha!')
      return
    }

    const parentCat = newCategory.isNewParent ? newCategory.newParentName : newCategory.parentCategory

    const newId = Math.max(...categories.map(c => c.id)) + 1
    addCategory({
      id: newId,
      name: newCategory.name,
      description: newCategory.description,
      parentCategory: parentCat,
      productCount: 0,
      status: 'active'
    })

    setNewCategory({ name: '', description: '', parentCategory: '', isNewParent: false, newParentName: '' })
    setShowAddModal(false)
    alert('Đã thêm danh mục thành công!')
  }

  const handleOpenEdit = (category: Category) => {
    setSelectedCategoryId(category.id)
    setEditCategory({
      name: category.name,
      description: category.description,
      parentCategory: category.parentCategory,
      isNewParent: false,
      newParentName: ''
    })
    setShowEditModal(true)
  }

  const handleUpdateCategory = () => {
    if (!editCategory.name || !editCategory.description) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    if (editCategory.isNewParent && !editCategory.newParentName) {
      alert('Vui lòng nhập tên danh mục cha mới!')
      return
    }

    if (!editCategory.isNewParent && !editCategory.parentCategory) {
      alert('Vui lòng chọn danh mục cha!')
      return
    }

    const parentCat = editCategory.isNewParent ? editCategory.newParentName : editCategory.parentCategory

    if (selectedCategoryId) {
      updateCategory(selectedCategoryId, {
        name: editCategory.name,
        description: editCategory.description,
        parentCategory: parentCat
      })

      setShowEditModal(false)
      setSelectedCategoryId(null)
      alert('Đã cập nhật danh mục thành công!')
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
      deleteCategory(id)
      alert('Đã xóa danh mục!')
    }
  }

  const handleToggleStatus = (id: number) => {
    const category = categories.find(c => c.id === id)
    if (category) {
      updateCategory(id, {
        status: category.status === 'active' ? 'inactive' : 'active'
      })
    }
  }

  const handleViewDetail = (category: Category) => {
    setSelectedCategoryId(category.id)
    setShowDetailModal(true)
  }

  const stats = [
    { label: 'Tổng danh mục', value: filteredCategories.length, subtext: 'Đang hoạt động' },
    { label: 'Sản phẩm', value: filteredCategories.reduce((sum, cat) => sum + cat.productCount, 0), subtext: 'Tổng sản phẩm' },
    { label: 'Danh mục cha', value: new Set(filteredCategories.map(c => c.parentCategory)).size, subtext: '' },
  ]

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header 
        title="QUẢN LÝ DANH MỤC"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm danh mục..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ background: '#1a1f2e', padding: '24px', borderRadius: '10px', border: '1px solid #2a2f3e' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>{stat.value}</div>
              <div style={{ fontSize: '15px', color: '#8b92a7', marginBottom: '4px' }}>{stat.label}</div>
              {stat.subtext && <div style={{ fontSize: '13px', color: '#6b7280' }}>{stat.subtext}</div>}
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
              <div style={{ fontSize: '14px', color: 'white', fontWeight: 500 }}>Tất cả danh mục</div>
              {selectedItems.length > 0 && (
                <>
                  <div style={{ fontSize: '13px', color: '#8b92a7' }}>({selectedItems.length} đã chọn)</div>
                  <button 
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa ${selectedItems.length} danh mục đã chọn?`)) {
                        setCategories(categories.filter(c => !selectedItems.includes(c.id)))
                        setSelectedItems([])
                        setSelectedAll(false)
                        alert('Đã xóa các danh mục!')
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
                      setCategories(categories.map(c => 
                        selectedItems.includes(c.id) ? { ...c, status: 'active' as const } : c
                      ))
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
                    Kích hoạt
                  </button>
                  <button 
                    onClick={() => {
                      setCategories(categories.map(c => 
                        selectedItems.includes(c.id) ? { ...c, status: 'inactive' as const } : c
                      ))
                      setSelectedItems([])
                      setSelectedAll(false)
                      alert('Đã tắt các danh mục!')
                    }}
                    style={{ 
                      padding: '6px 14px', 
                      background: '#6b7280', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    Tắt
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
                + Thêm danh mục
              </button>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                style={{
                  padding: '8px 12px',
                  background: '#0f1419',
                  border: '1px solid #2a2f3e',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}>
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2f3e', fontSize: '12px', color: '#6b7280' }}>
            Hiện thị 1-{filteredCategories.length} trong {filteredCategories.length} kết quả
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
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>STT</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TÊN DANH MỤC</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>MÔ DANH MỤC</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>SẢN PHẨM</th>
                <th style={{ padding: '20px 28px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>DANH MỤC CHA</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TRẠNG THÁI</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category, index) => (
                <tr key={category.id} style={{ borderBottom: '1px solid #2a2f3e', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '24px 28px' }}>
                    <input type="checkbox" checked={selectedItems.includes(category.id)} onChange={() => handleSelectItem(category.id)} style={{ cursor: 'pointer', width: '20px', height: '20px' }} />
                  </td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{index + 1}</td>
                  <td style={{ padding: '24px 28px', color: 'white', fontSize: '16px', fontWeight: 500 }}>{category.name}</td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{category.description}</td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px', textAlign: 'center' }}>{category.productCount}</td>
                  <td style={{ padding: '24px 28px', color: '#8b92a7', fontSize: '15px' }}>{category.parentCategory}</td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleToggleStatus(category.id)}
                      style={{ 
                        padding: '6px 14px', 
                        borderRadius: '6px', 
                        fontSize: '13px',
                        fontWeight: 600,
                        background: category.status === 'active' ? '#10b98120' : '#ef444420',
                        color: category.status === 'active' ? '#10b981' : '#ef4444',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      {category.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </button>
                  </td>
                  <td style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleViewDetail(category)}
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
                        onClick={() => handleDelete(category.id)}
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

        {/* Modal Thêm Danh Mục */}
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
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>Thêm Danh Mục Mới</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Tên danh mục</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên danh mục"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Mô tả</label>
                <input 
                  type="text" 
                  placeholder="Nhập mô tả"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
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

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Danh mục cha</label>
                <select 
                  value={newCategory.isNewParent ? 'new' : newCategory.parentCategory}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setNewCategory({...newCategory, isNewParent: true, parentCategory: ''})
                    } else {
                      setNewCategory({...newCategory, isNewParent: false, parentCategory: e.target.value, newParentName: ''})
                    }
                  }}
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
                  <option value="">Chọn danh mục cha</option>
                  <option value="Điện tử">Điện tử</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                  <option value="Thời trang">Thời trang</option>
                  <option value="Gia dụng">Gia dụng</option>
                  <option value="new" style={{ color: '#f97316', fontWeight: 600 }}>+ Tạo danh mục cha mới</option>
                </select>
                
                {newCategory.isNewParent && (
                  <input 
                    type="text" 
                    placeholder="Nhập tên danh mục cha mới"
                    value={newCategory.newParentName}
                    onChange={(e) => setNewCategory({...newCategory, newParentName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px',
                      marginTop: '12px'
                    }} 
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
                    setNewCategory({ name: '', description: '', parentCategory: '', isNewParent: false, newParentName: '' })
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
                  onClick={handleAddCategory}
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
                  Thêm Danh Mục
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Chi Tiết */}
        {showDetailModal && selectedCategory && (
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
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>Chi Tiết Danh Mục</h2>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '6px' }}>Tên danh mục</div>
                <div style={{ fontSize: '18px', color: 'white', fontWeight: 600 }}>{selectedCategory.name}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '6px' }}>Mô tả</div>
                <div style={{ fontSize: '15px', color: 'white' }}>{selectedCategory.description}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '6px' }}>Danh mục cha</div>
                <div style={{ fontSize: '15px', color: 'white' }}>{selectedCategory.parentCategory}</div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', color: '#8b92a7', marginBottom: '6px' }}>Số sản phẩm</div>
                <div style={{ fontSize: '24px', color: '#3b82f6', fontWeight: 700 }}>{selectedCategory.productCount}</div>
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
                    fontWeight: 500
                  }}
                >
                  Đóng
                </button>
                <button 
                  onClick={() => {
                    setShowDetailModal(false)
                    handleOpenEdit(selectedCategory)
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 500
                  }}
                >
                  Chỉnh Sửa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Chỉnh Sửa */}
        {showEditModal && selectedCategory && (
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
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600 }}>Chỉnh Sửa Danh Mục</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Tên danh mục</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên danh mục"
                  value={editCategory.name}
                  onChange={(e) => setEditCategory({...editCategory, name: e.target.value})}
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Mô tả</label>
                <input 
                  type="text" 
                  placeholder="Nhập mô tả"
                  value={editCategory.description}
                  onChange={(e) => setEditCategory({...editCategory, description: e.target.value})}
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

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b92a7' }}>Danh mục cha</label>
                <select 
                  value={editCategory.isNewParent ? 'new' : editCategory.parentCategory}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setEditCategory({...editCategory, isNewParent: true, parentCategory: ''})
                    } else {
                      setEditCategory({...editCategory, isNewParent: false, parentCategory: e.target.value, newParentName: ''})
                    }
                  }}
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
                  <option value="">Chọn danh mục cha</option>
                  <option value="Điện tử">Điện tử</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                  <option value="Thời trang">Thời trang</option>
                  <option value="Gia dụng">Gia dụng</option>
                  <option value="new" style={{ color: '#f97316', fontWeight: 600 }}>+ Tạo danh mục cha mới</option>
                </select>
                
                {editCategory.isNewParent && (
                  <input 
                    type="text" 
                    placeholder="Nhập tên danh mục cha mới"
                    value={editCategory.newParentName}
                    onChange={(e) => setEditCategory({...editCategory, newParentName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#0f1419',
                      border: '1px solid #2a2f3e',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '15px',
                      marginTop: '12px'
                    }} 
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditCategory({ name: '', description: '', parentCategory: '', isNewParent: false, newParentName: '' })
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
                  onClick={handleUpdateCategory}
                  style={{
                    padding: '12px 24px',
                    background: '#10b981',
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

export default Category
