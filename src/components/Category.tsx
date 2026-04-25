import { useMemo, useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { api } from '../api'
import { DEFAULT_CATEGORIES, useStore } from '../store/useStore'
import Header from './Header'

type CategoryForm = {
  name: string
  description: string
  parentCategory: string
}

const emptyForm: CategoryForm = {
  name: '',
  description: '',
  parentCategory: '',
}

const normalizeDisplayText = (value: string) => {
  const replacements: Record<string, string> = {
    'Kh?c': 'Khác',
    'Kh�c': 'Khác',
    'Di?n t?': 'Điện tử',
    '?i?n t?': 'Điện tử',
  }

  return replacements[value] ?? value
}

function Category() {
  const categories = useStore((state) => state.categories)
  const setCategories = useStore((state) => state.setCategories)
  const visibleCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [editTargetId, setEditTargetId] = useState<number | null>(null)
  const [form, setForm] = useState<CategoryForm>(emptyForm)

  const filteredCategories = useMemo(
    () =>
      visibleCategories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.parentCategory.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [visibleCategories, searchTerm],
  )

  const selectedCategory = selectedCategoryId
    ? visibleCategories.find((category) => category.id === selectedCategoryId) ?? null
    : null

  const openAddModal = () => {
    setForm(emptyForm)
    setShowAddModal(true)
  }

  const openEditModal = (category: (typeof visibleCategories)[number]) => {
    setEditTargetId(category.id)
    setForm({
      name: normalizeDisplayText(category.name),
      description: normalizeDisplayText(category.description),
      parentCategory: normalizeDisplayText(category.parentCategory),
    })
    setShowEditModal(true)
  }

  const handleCreate = async () => {
    if (!form.name || !form.description) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    try {
      const created = await api.createCategory({
        name: form.name,
        description: form.description,
        parentCategory: form.parentCategory || undefined,
      })

      setCategories([
        ...visibleCategories,
        {
          id: created.id,
          name: created.name,
          description: created.description ?? '',
          productCount: created.productCount ?? 0,
          parentCategory: created.parentCategory ?? '',
          status: created.status ?? 'active',
        },
      ])

      setShowAddModal(false)
      setForm(emptyForm)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Thêm danh mục thất bại')
    }
  }

  const handleUpdate = async () => {
    if (!editTargetId) return

    if (!form.name || !form.description) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    try {
      const updated = await api.updateCategory(editTargetId, {
        name: form.name,
        description: form.description,
        parentCategory: form.parentCategory || null,
      })

      setCategories(
        visibleCategories.map((category) =>
          category.id === editTargetId
            ? {
                ...category,
                name: updated.name,
                description: updated.description ?? '',
                parentCategory: updated.parentCategory ?? '',
                status: updated.status ?? category.status,
                productCount: updated.productCount ?? category.productCount,
              }
            : category,
        ),
      )

      setShowEditModal(false)
      setEditTargetId(null)
      setForm(emptyForm)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Cập nhật danh mục thất bại')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return

    try {
      await api.deleteCategory(id)
      setCategories(visibleCategories.filter((category) => category.id !== id))
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Xóa danh mục thất bại')
    }
  }

  const handleToggleStatus = async (category: (typeof visibleCategories)[number]) => {
    try {
      const nextStatus = category.status === 'active' ? 'inactive' : 'active'
      const updated = await api.updateCategory(category.id, { status: nextStatus })

      setCategories(
        visibleCategories.map((item) =>
          item.id === category.id
            ? {
                ...item,
                status: updated.status ?? nextStatus,
              }
            : item,
        ),
      )
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Cập nhật trạng thái thất bại')
    }
  }

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header
        title="QUẢN LÝ DANH MỤC"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm danh mục..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ color: '#8b92a7' }}>Hiển thị {filteredCategories.length} danh mục</div>
          <button
            onClick={openAddModal}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              background: '#f97316',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            + Thêm danh mục
          </button>
        </div>

        <div style={{ background: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1419', borderBottom: '1px solid #2a2f3e' }}>
                <th style={thStyle}>Tên danh mục</th>
                <th style={thStyle}>Mô tả</th>
                <th style={thStyle}>Danh mục cha</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Sản phẩm</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Trạng thái</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '36px 18px', color: '#8b92a7' }}>
                    Không có danh mục nào
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} style={{ borderBottom: '1px solid #2a2f3e' }}>
                    <td style={tdStyle}>{normalizeDisplayText(category.name)}</td>
                    <td style={tdStyle}>{normalizeDisplayText(category.description)}</td>
                    <td style={tdStyle}>{normalizeDisplayText(category.parentCategory || '-')}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{category.productCount}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={badgeStyle(category.status === 'active' ? '#10b981' : '#ef4444')}>
                        {category.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => setSelectedCategoryId(category.id)} style={actionButton('#3b82f6')}>
                          Chi tiết
                        </button>
                        <button onClick={() => openEditModal(category)} style={actionButton('#10b981')}>
                          Sửa
                        </button>
                        <button onClick={() => handleToggleStatus(category)} style={actionButton('#7c3aed')}>
                          {category.status === 'active' ? 'Tắt' : 'Bật'}
                        </button>
                        <button onClick={() => handleDelete(category.id)} style={actionButton('#ef4444')}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <Modal title="Thêm danh mục mới" onClose={() => setShowAddModal(false)} onSubmit={handleCreate} submitLabel="Thêm danh mục">
          <FormFields form={form} setForm={setForm} />
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Chỉnh sửa danh mục" onClose={() => setShowEditModal(false)} onSubmit={handleUpdate} submitLabel="Cập nhật">
          <FormFields form={form} setForm={setForm} />
        </Modal>
      )}

      {selectedCategory && (
        <Modal title="Chi tiết danh mục" onClose={() => setSelectedCategoryId(null)} hideSubmit>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div><strong>Tên:</strong> {normalizeDisplayText(selectedCategory.name)}</div>
            <div><strong>Mô tả:</strong> {normalizeDisplayText(selectedCategory.description)}</div>
            <div><strong>Danh mục cha:</strong> {normalizeDisplayText(selectedCategory.parentCategory || '-')}</div>
            <div><strong>Sản phẩm:</strong> {selectedCategory.productCount}</div>
            <div><strong>Trạng thái:</strong> {selectedCategory.status}</div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FormFields({
  form,
  setForm,
}: {
  form: CategoryForm
  setForm: Dispatch<SetStateAction<CategoryForm>>
}) {
  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên danh mục" style={inputStyle} />
      <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả" style={inputStyle} />
      <input value={form.parentCategory} onChange={(e) => setForm({ ...form, parentCategory: e.target.value })} placeholder="Danh mục cha" style={inputStyle} />
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
  width: 'min(100%, 640px)',
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

function badgeStyle(color: string): CSSProperties {
  return {
    padding: '6px 12px',
    borderRadius: '999px',
    background: `${color}20`,
    color,
    fontWeight: 700,
    fontSize: '13px',
  }
}

export default Category
