import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { api } from '../api'
import { DEFAULT_CATEGORIES, useStore } from '../store/useStore'
import Header from './Header'
import '../styles/danh-muc.css'

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
    'Khï¿½c': 'Khác',
    'Di?n t?': 'Điện tử',
    'Äiá»‡n tá»­': 'Điện tử',
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
        normalizeDisplayText(category.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        normalizeDisplayText(category.description).toLowerCase().includes(searchTerm.toLowerCase()) ||
        normalizeDisplayText(category.parentCategory).toLowerCase().includes(searchTerm.toLowerCase()),
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
    <div className="category-page">
      <Header
        title="QUẢN LÝ DANH MỤC"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm danh mục..."
      />

      <div className="category-page__content">
        <div className="category-page__toolbar">
          <div className="category-page__count">Hiển thị {filteredCategories.length} danh mục</div>
          <button onClick={openAddModal} className="btn btn--primary">+ Thêm danh mục</button>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Danh mục cha</th>
                <th className="data-table__center">Sản phẩm</th>
                <th className="data-table__center">Trạng thái</th>
                <th className="data-table__center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="data-table__empty">Không có danh mục nào</td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="data-table__row">
                    <td>{normalizeDisplayText(category.name)}</td>
                    <td>{normalizeDisplayText(category.description)}</td>
                    <td>{normalizeDisplayText(category.parentCategory || '-')}</td>
                    <td className="data-table__center">{category.productCount}</td>
                    <td className="data-table__center">
                      <span className={`badge ${category.status === 'active' ? 'badge--active' : 'badge--inactive'}`}>
                        {category.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="data-table__center">
                      <div className="button-row">
                        <button onClick={() => setSelectedCategoryId(category.id)} className="btn btn--blue">Chi tiết</button>
                        <button onClick={() => openEditModal(category)} className="btn btn--green">Sửa</button>
                        <button onClick={() => handleToggleStatus(category)} className="btn btn--purple">
                          {category.status === 'active' ? 'Tắt' : 'Bật'}
                        </button>
                        <button onClick={() => handleDelete(category.id)} className="btn btn--red">Xóa</button>
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
          <div className="modal-card__fields" style={{ gap: '12px' }}>
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
    <div className="modal-card__fields">
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên danh mục" className="field" />
      <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả" className="field" />
      <input value={form.parentCategory} onChange={(e) => setForm({ ...form, parentCategory: e.target.value })} placeholder="Danh mục cha" className="field" />
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2 className="modal-card__title">{title}</h2>
          <button onClick={onClose} className="modal-card__close">×</button>
        </div>
        {children}
        {!hideSubmit && onSubmit && (
          <div className="modal-card__actions">
            <button onClick={onClose} className="btn btn--secondary">Hủy</button>
            <button onClick={onSubmit} className="btn btn--primary">{submitLabel}</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Category
