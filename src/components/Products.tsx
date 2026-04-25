import { useMemo, useRef, useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { api } from '../api'
import { useStore } from '../store/useStore'
import { DEFAULT_PRODUCTS } from '../defaultProducts'
import Header from './Header'

type ProductForm = {
  name: string
  sku: string
  category: string
  price: string
  stock: string
  image: string
  description: string
}

const emptyForm: ProductForm = {
  name: '',
  sku: '',
  category: '',
  price: '',
  stock: '',
  image: '',
  description: '',
}

function Products() {
  const products = useStore((state) => state.products)
  const addProduct = useStore((state) => state.addProduct)
  const updateProduct = useStore((state) => state.updateProduct)
  const deleteProduct = useStore((state) => state.deleteProduct)
  const visibleProducts = products.length > 0 ? products : DEFAULT_PRODUCTS

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [editTargetId, setEditTargetId] = useState<number | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const addImageInputRef = useRef<HTMLInputElement | null>(null)
  const editImageInputRef = useRef<HTMLInputElement | null>(null)

  const categories = useMemo(() => ['all', ...Array.from(new Set(visibleProducts.map((product) => product.category)))], [visibleProducts])

  const filteredProducts = visibleProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const selectedProduct = selectedProductId ? visibleProducts.find((product) => product.id === selectedProductId) ?? null : null

  const openAddModal = () => {
    setForm(emptyForm)
    setShowAddModal(true)
  }

  const openEditModal = (product: (typeof visibleProducts)[number]) => {
    setEditTargetId(product.id)
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image ?? '',
      description: product.description ?? '',
    })
    setShowEditModal(true)
  }

  const handleImageFile = (file: File | undefined) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (result) {
        setForm((current) => ({ ...current, image: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCreate = async () => {
    if (!form.name || !form.sku || !form.category || !form.price || !form.stock) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    try {
      const created = await api.createProduct({
        name: form.name,
        sku: form.sku,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description,
        image: form.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
      })

      addProduct({
        id: created.id,
        name: created.name,
        sku: created.sku,
        category: created.category,
        price: created.price,
        stock: created.stock,
        image: created.image,
        sold: created.sold ?? 0,
        description: created.description ?? '',
      })

      setShowAddModal(false)
      setForm(emptyForm)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Thêm sản phẩm thất bại')
    }
  }

  const handleUpdate = async () => {
    if (!editTargetId) {
      return
    }

    if (!form.name || !form.sku || !form.category || !form.price || !form.stock) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    try {
      const updated = await api.updateProduct(editTargetId, {
        name: form.name,
        sku: form.sku,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.image || undefined,
        description: form.description,
      })

      updateProduct(editTargetId, {
        name: updated.name,
        sku: updated.sku,
        category: updated.category,
        price: updated.price,
        stock: updated.stock,
        image: updated.image,
        sold: updated.sold ?? 0,
        description: updated.description ?? '',
      })

      setShowEditModal(false)
      setEditTargetId(null)
      setForm(emptyForm)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Cập nhật sản phẩm thất bại')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return
    }

    try {
      await api.deleteProduct(id)
      deleteProduct(id)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Xóa sản phẩm thất bại')
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
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '10px 16px',
                borderRadius: '999px',
                border: selectedCategory === category ? '1px solid #8c85ef' : '1px solid #2a3140',
                background: selectedCategory === category ? '#7a73ea' : '#151a22',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {category === 'all' ? 'Tất cả' : category}
            </button>
          ))}
          <button
            onClick={openAddModal}
            style={{
              marginLeft: 'auto',
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              background: '#f97316',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            + Thêm sản phẩm
          </button>
        </div>

        <div style={{ background: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2f3e', color: '#8b92a7', fontSize: '13px' }}>
            Hiển thị {filteredProducts.length} sản phẩm
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1419', borderBottom: '1px solid #2a2f3e' }}>
                <th style={thStyle}>Sản phẩm</th>
                <th style={thStyle}>SKU</th>
                <th style={thStyle}>Ảnh</th>
                <th style={thStyle}>Danh mục</th>
                <th style={thStyle}>Giá</th>
                <th style={thStyle}>Kho</th>
                <th style={thStyle}>Đã bán</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #2a2f3e' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={product.image} alt={product.name} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'white' }}>{product.name}</div>
                        <div style={{ color: '#8b92a7', fontSize: '13px' }}>{product.description || 'Không có mô tả'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>{product.sku}</td>
                  <td style={tdStyle}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #2a2f3e' }}
                    />
                  </td>
                  <td style={tdStyle}>{product.category}</td>
                  <td style={tdStyle}>{money(product.price)}</td>
                  <td style={tdStyle}>{product.stock}</td>
                  <td style={tdStyle}>{product.sold}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={() => setSelectedProductId(product.id)} style={actionButton('#3b82f6')}>Chi tiết</button>
                      <button onClick={() => openEditModal(product)} style={actionButton('#10b981')}>Sửa</button>
                      <button onClick={() => handleDelete(product.id)} style={actionButton('#ef4444')}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <Modal title="Thêm sản phẩm mới" onClose={() => setShowAddModal(false)} onSubmit={handleCreate} submitLabel="Thêm sản phẩm">
          <FormFields form={form} setForm={setForm} onPickImage={() => addImageInputRef.current?.click()} />
          <input
            ref={addImageInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              handleImageFile(event.target.files?.[0])
              event.currentTarget.value = ''
            }}
          />
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Chỉnh sửa sản phẩm" onClose={() => setShowEditModal(false)} onSubmit={handleUpdate} submitLabel="Cập nhật">
          <FormFields form={form} setForm={setForm} onPickImage={() => editImageInputRef.current?.click()} />
          <input
            ref={editImageInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              handleImageFile(event.target.files?.[0])
              event.currentTarget.value = ''
            }}
          />
        </Modal>
      )}

      {selectedProduct && (
        <Modal title="Chi tiết sản phẩm" onClose={() => setSelectedProductId(null)} hideSubmit>
          <div style={{ display: 'grid', gap: '12px' }}>
            <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px' }} />
            <div><strong>Tên:</strong> {selectedProduct.name}</div>
            <div><strong>SKU:</strong> {selectedProduct.sku}</div>
            <div><strong>Danh mục:</strong> {selectedProduct.category}</div>
            <div><strong>Giá:</strong> {money(selectedProduct.price)}</div>
            <div><strong>Tồn kho:</strong> {selectedProduct.stock}</div>
            <div><strong>Đã bán:</strong> {selectedProduct.sold}</div>
            <div><strong>Mô tả:</strong> {selectedProduct.description || 'Không có mô tả'}</div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FormFields({
  form,
  setForm,
  onPickImage,
}: {
  form: ProductForm
  setForm: Dispatch<SetStateAction<ProductForm>>
  onPickImage: () => void
}) {
  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên sản phẩm" style={inputStyle} />
      <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" style={inputStyle} />
      <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Danh mục" style={inputStyle} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Giá" type="number" style={inputStyle} />
        <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Số lượng" type="number" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={onPickImage} style={secondaryButtonStyle}>
            Chọn ảnh từ máy
          </button>
          <input
            value={form.image.startsWith('data:') ? 'Đã chọn ảnh từ máy' : form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="Hoặc dán URL ảnh"
            style={{ ...inputStyle, flex: 1, minWidth: '240px' }}
          />
        </div>
        <div style={{ color: '#8b92a7', fontSize: '13px' }}>
          Chọn file sẽ mở cửa sổ chọn ảnh trên máy và lưu ảnh để xem trước.
        </div>
      </div>
      {form.image && (
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ color: '#8b92a7', fontSize: '13px' }}>Xem trước ảnh</div>
          <img
            src={form.image}
            alt="Preview"
            style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #2a2f3e' }}
          />
        </div>
      )}
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
    </div>
  )
}

function Modal({
  title,
  onClose,
  onSubmit,
  submitLabel = 'Lưu',
  hideSubmit = false,
  children,
}: {
  title: string
  onClose: () => void
  onSubmit?: () => void
  submitLabel?: string
  hideSubmit?: boolean
  children: ReactNode
}) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>{title}</h2>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>
        {children}
        {!hideSubmit && onSubmit && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button onClick={onClose} style={secondaryButtonStyle}>Hủy</button>
            <button onClick={onSubmit} style={primaryButtonStyle}>{submitLabel}</button>
          </div>
        )}
      </div>
    </div>
  )
}

const thStyle: CSSProperties = {
  padding: '16px 18px',
  textAlign: 'left',
  color: '#8b92a7',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
}

const tdStyle: CSSProperties = {
  padding: '16px 18px',
  color: '#cbd5e1',
  verticalAlign: 'middle',
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: '#0f1419',
  border: '1px solid #2a2f3e',
  borderRadius: '10px',
  color: 'white',
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 1000,
}

const modalStyle: CSSProperties = {
  width: 'min(100%, 760px)',
  background: '#1a1f2e',
  border: '1px solid #2a2f3e',
  borderRadius: '16px',
  padding: '24px',
}

const closeButtonStyle: CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  border: '1px solid #2a2f3e',
  background: '#0f1419',
  color: 'white',
  cursor: 'pointer',
  fontSize: '20px',
}

const primaryButtonStyle: CSSProperties = {
  padding: '10px 16px',
  borderRadius: '10px',
  border: 'none',
  background: '#7a73ea',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

const secondaryButtonStyle: CSSProperties = {
  padding: '10px 16px',
  borderRadius: '10px',
  border: '1px solid #2a2f3e',
  background: '#0f1419',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

function actionButton(color: string): CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    background: color,
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  }
}

function money(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export default Products
