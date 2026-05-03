import { useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import Header from './Header'
import { api } from '../api'
import { useStore } from '../store/useStore'
import { DEFAULT_PRODUCTS } from '../defaultProducts'
import '../styles/san-pham.css'

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

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

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

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return visibleProducts.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesSearch = !term || product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)
      return matchesCategory && matchesSearch
    })
  }, [searchTerm, selectedCategory, visibleProducts])

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
    if (!editTargetId) return

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
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    try {
      await api.deleteProduct(id)
      deleteProduct(id)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Xóa sản phẩm thất bại')
    }
  }

  return (
    <div className="product-page">
      <Header title="DANH SÁCH SẢN PHẨM" searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Tìm kiếm sản phẩm..." />

      <div className="product-page__content">
        <div className="product-page__filters">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`product-page__btn-chip ${selectedCategory === category ? 'product-page__btn-chip--active' : ''}`}
            >
              {category === 'all' ? 'Tất cả' : category}
            </button>
          ))}
          <button onClick={openAddModal} className="product-page__btn-primary product-page__btn-primary--add">
            + Thêm sản phẩm
          </button>
        </div>

        <div className="product-page__card">
          <div className="product-page__section-title">Hiển thị {filteredProducts.length} sản phẩm</div>

          <table className="product-page__table">
            <thead>
              <tr className="product-page__table-head">
                <th className="product-page__th">Sản phẩm</th>
                <th className="product-page__th">SKU</th>
                <th className="product-page__th">Ảnh</th>
                <th className="product-page__th">Danh mục</th>
                <th className="product-page__th">Giá</th>
                <th className="product-page__th">Kho</th>
                <th className="product-page__th">Đã bán</th>
                <th className="product-page__th product-page__th--center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="product-page__table-row">
                  <td className="product-page__td">
                    <div className="product-page__product-cell">
                      <img src={product.image} alt={product.name} className="product-page__thumb" />
                      <div>
                        <div className="product-page__product-name">{product.name}</div>
                        <div className="product-page__product-desc">{product.description || 'Không có mô tả'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="product-page__td">{product.sku}</td>
                  <td className="product-page__td">
                    <img src={product.image} alt={product.name} className="product-page__thumb--small" />
                  </td>
                  <td className="product-page__td">{product.category}</td>
                  <td className="product-page__td">{moneyFormatter.format(product.price)}</td>
                  <td className="product-page__td">{product.stock}</td>
                  <td className="product-page__td">{product.sold}</td>
                  <td className="product-page__td product-page__td--center">
                    <div className="product-page__actions">
                      <button onClick={() => setSelectedProductId(product.id)} className="product-page__btn-action product-page__btn-action--info">
                        Chi tiết
                      </button>
                      <button onClick={() => openEditModal(product)} className="product-page__btn-action product-page__btn-action--success">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="product-page__btn-action product-page__btn-action--danger">
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
          <div className="product-page__detail-grid">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="product-page__detail-image" />
            <div className="product-page__detail-info">
              <div><strong>Tên:</strong> {selectedProduct.name}</div>
              <div><strong>SKU:</strong> {selectedProduct.sku}</div>
              <div><strong>Danh mục:</strong> {selectedProduct.category}</div>
              <div><strong>Giá:</strong> {moneyFormatter.format(selectedProduct.price)}</div>
              <div><strong>Tồn kho:</strong> {selectedProduct.stock}</div>
              <div><strong>Đã bán:</strong> {selectedProduct.sold}</div>
              <div><strong>Mô tả:</strong> {selectedProduct.description || 'Không có mô tả'}</div>
            </div>
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
    <div className="product-page__modal-fields">
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên sản phẩm" className="product-page__input" />
      <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" className="product-page__input" />
      <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Danh mục" className="product-page__input" />
      <div className="product-page__modal-grid-2">
        <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Giá" type="number" className="product-page__input" />
        <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Số lượng" type="number" className="product-page__input" />
      </div>
      <div className="product-page__modal-image-row">
        <button type="button" onClick={onPickImage} className="product-page__btn-secondary">
          Chọn ảnh từ máy
        </button>
        <input
          value={form.image.startsWith('data:') ? 'Đã chọn ảnh từ máy' : form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          placeholder="Hoặc dán URL ảnh"
          className="product-page__input product-page__input--flex"
        />
      </div>
      <div className="product-page__modal-image-help">Chọn file sẽ mở cửa sổ chọn ảnh trên máy và lưu ảnh để xem trước.</div>
      {form.image && (
        <div className="product-page__preview-group">
          <div className="product-page__modal-image-help">Xem trước ảnh</div>
          <img src={form.image} alt="Preview" className="product-page__preview" />
        </div>
      )}
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả" rows={4} className="product-page__textarea" />
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
    <div className="product-page__modal-overlay" onClick={onClose}>
      <div className="product-page__modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-page__modal-header">
          <h2 className="product-page__modal-title">{title}</h2>
          <button onClick={onClose} className="product-page__btn-close">
            ×
          </button>
        </div>
        {children}
        {!hideSubmit && onSubmit && (
          <div className="product-page__modal-actions">
            <button onClick={onClose} className="product-page__btn-secondary">
              Hủy
            </button>
            <button onClick={onSubmit} className="product-page__btn-primary">
              {submitLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
