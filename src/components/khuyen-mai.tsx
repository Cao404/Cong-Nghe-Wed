import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import Header from './Header'
import '../styles/khuyen-mai.css'
import { api, type ApiVoucher } from '../api'

type VoucherForm = {
  code: string
  name: string
  type: 'percentage' | 'fixed'
  value: string
  minOrder: string
  maxDiscount: string
  quantity: string
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'expired'
}

const emptyForm: VoucherForm = {
  code: '',
  name: '',
  type: 'percentage',
  value: '',
  minOrder: '',
  maxDiscount: '',
  quantity: '',
  startDate: '',
  endDate: '',
  status: 'active',
}

function Promo() {
  const [vouchers, setVouchers] = useState<ApiVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<VoucherForm>(emptyForm)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.getVouchers()
        if (!cancelled) setVouchers(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tải voucher')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return vouchers.filter((voucher) => {
      const matchesTerm = !term || voucher.code.toLowerCase().includes(term) || voucher.name.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'all' || voucher.status === statusFilter
      return matchesTerm && matchesStatus
    })
  }, [searchTerm, statusFilter, vouchers])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const current = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const selectedVoucher = selectedId ? vouchers.find((voucher) => voucher.id === selectedId) ?? null : null

  const stats = [
    { label: 'Tổng voucher', value: vouchers.length, tone: 'blue' as const },
    { label: 'Đang hoạt động', value: vouchers.filter((voucher) => voucher.status === 'active').length, tone: 'green' as const },
    { label: 'Tạm dừng', value: vouchers.filter((voucher) => voucher.status === 'inactive').length, tone: 'gray' as const },
    { label: 'Hết hạn', value: vouchers.filter((voucher) => voucher.status === 'expired').length, tone: 'red' as const },
  ]

  const openCreate = () => {
    setEditingId(null)
    setSelectedId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (voucher: ApiVoucher) => {
    setEditingId(voucher.id)
    setSelectedId(voucher.id)
    setForm({
      code: voucher.code,
      name: voucher.name,
      type: voucher.type === 'fixed' ? 'fixed' : 'percentage',
      value: String(voucher.value),
      minOrder: String(voucher.minOrder),
      maxDiscount: String(voucher.maxDiscount),
      quantity: String(voucher.quantity),
      startDate: voucher.startDate.slice(0, 10),
      endDate: voucher.endDate.slice(0, 10),
      status: voucher.status === 'inactive' || voucher.status === 'expired' ? voucher.status : 'active',
    })
    setShowForm(true)
  }

  const submit = async () => {
    if (!form.code || !form.name || !form.value || !form.quantity || !form.startDate || !form.endDate) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    try {
      const payload = {
        code: form.code,
        name: form.name,
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder || 0),
        maxDiscount: Number(form.maxDiscount || 0),
        quantity: Number(form.quantity),
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
      }

      if (editingId) {
        const updated = await api.updateVoucher(editingId, payload)
        setVouchers((currentVouchers) => currentVouchers.map((voucher) => (voucher.id === editingId ? updated : voucher)))
      } else {
        const created = await api.createVoucher(payload)
        setVouchers((currentVouchers) => [created, ...currentVouchers])
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể lưu voucher')
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return
    try {
      await api.deleteVoucher(id)
      setVouchers((currentVouchers) => currentVouchers.filter((voucher) => voucher.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa voucher')
    }
  }

  const toggleStatus = async (voucher: ApiVoucher) => {
    const nextStatus = voucher.status === 'active' ? 'inactive' : 'active'
    try {
      const updated = await api.updateVoucher(voucher.id, { status: nextStatus })
      setVouchers((currentVouchers) => currentVouchers.map((item) => (item.id === voucher.id ? updated : item)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái')
    }
  }

  return (
    <div className="khuyen-mai-page">
      <Header
        title="KHUYẾN MÃI & VOUCHER"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm voucher..."
      />

      <div className="khuyen-mai-page__content">
        <div className="khuyen-mai-page__stats">
          {stats.map((stat) => (
            <div key={stat.label} className={`khuyen-mai-page__stat khuyen-mai-page__stat--${stat.tone}`}>
              <div className="khuyen-mai-page__stat-label">{stat.label}</div>
              <div className="khuyen-mai-page__stat-value">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="khuyen-mai-page__panel">
          <div className="khuyen-mai-page__toolbar">
            <div className="khuyen-mai-page__toolbar-text">{loading ? 'Đang tải...' : error || `Hiển thị ${filtered.length} voucher`}</div>
            <div className="khuyen-mai-page__toolbar-actions">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="khuyen-mai-page__select">
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
                <option value="expired">Hết hạn</option>
              </select>
              <button onClick={openCreate} className="khuyen-mai-page__button khuyen-mai-page__button--primary">
                + Tạo Voucher
              </button>
            </div>
          </div>

          <table className="khuyen-mai-page__table">
            <thead>
              <tr className="khuyen-mai-page__table-head">
                <th className="khuyen-mai-page__th">Mã</th>
                <th className="khuyen-mai-page__th">Tên</th>
                <th className="khuyen-mai-page__th">Giảm giá</th>
                <th className="khuyen-mai-page__th">Số lượng</th>
                <th className="khuyen-mai-page__th">Thời gian</th>
                <th className="khuyen-mai-page__th">Trạng thái</th>
                <th className="khuyen-mai-page__th khuyen-mai-page__th--right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && current.length === 0 ? (
                <tr>
                  <td colSpan={7} className="khuyen-mai-page__empty-cell">
                    Không có voucher nào
                  </td>
                </tr>
              ) : (
                current.map((voucher) => (
                  <tr key={voucher.id} className="khuyen-mai-page__row">
                    <td className="khuyen-mai-page__td"><strong className="khuyen-mai-page__code">{voucher.code}</strong></td>
                    <td className="khuyen-mai-page__td">
                      <div className="khuyen-mai-page__name">{voucher.name}</div>
                      <div className="khuyen-mai-page__muted">Đơn tối thiểu: {voucher.minOrder.toLocaleString('vi-VN')}đ</div>
                    </td>
                    <td className="khuyen-mai-page__td">
                      {voucher.type === 'fixed' ? `${voucher.value.toLocaleString('vi-VN')}đ` : `${voucher.value}%`}
                      <div className="khuyen-mai-page__muted">Tối đa {voucher.maxDiscount.toLocaleString('vi-VN')}đ</div>
                    </td>
                    <td className="khuyen-mai-page__td">{voucher.used}/{voucher.quantity}</td>
                    <td className="khuyen-mai-page__td">
                      <div>{formatDate(voucher.startDate)}</div>
                      <div className="khuyen-mai-page__muted">{formatDate(voucher.endDate)}</div>
                    </td>
                    <td className="khuyen-mai-page__td">
                      <span className={`khuyen-mai-page__badge khuyen-mai-page__badge--${voucher.status}`}>
                        {voucher.status}
                      </span>
                    </td>
                    <td className="khuyen-mai-page__td khuyen-mai-page__td--right">
                      <div className="khuyen-mai-page__actions">
                        <button onClick={() => openEdit(voucher)} className="khuyen-mai-page__button khuyen-mai-page__button--blue">Sửa</button>
                        <button onClick={() => toggleStatus(voucher)} className="khuyen-mai-page__button khuyen-mai-page__button--green">
                          {voucher.status === 'active' ? 'Tắt' : 'Bật'}
                        </button>
                        <button onClick={() => remove(voucher.id)} className="khuyen-mai-page__button khuyen-mai-page__button--red">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="khuyen-mai-page__pagination">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="khuyen-mai-page__page">
                ←
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`khuyen-mai-page__page ${currentPage === page ? 'khuyen-mai-page__page--active' : ''}`}
                >
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="khuyen-mai-page__page">
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <Modal title={editingId ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'} onClose={() => setShowForm(false)} onSubmit={submit}>
          <FormFields form={form} setForm={setForm} />
        </Modal>
      )}

      {selectedVoucher && !showForm && (
        <Modal title="Chi tiết voucher" onClose={() => setSelectedId(null)} hideSubmit>
          <div className="khuyen-mai-page__detail">
            <div><strong>Mã:</strong> {selectedVoucher.code}</div>
            <div><strong>Tên:</strong> {selectedVoucher.name}</div>
            <div><strong>Loại:</strong> {selectedVoucher.type}</div>
            <div><strong>Giá trị:</strong> {selectedVoucher.type === 'fixed' ? `${selectedVoucher.value.toLocaleString('vi-VN')}đ` : `${selectedVoucher.value}%`}</div>
            <div><strong>Giảm tối đa:</strong> {selectedVoucher.maxDiscount.toLocaleString('vi-VN')}đ</div>
            <div><strong>Đơn tối thiểu:</strong> {selectedVoucher.minOrder.toLocaleString('vi-VN')}đ</div>
            <div><strong>Số lượng:</strong> {selectedVoucher.used}/{selectedVoucher.quantity}</div>
            <div><strong>Thời gian:</strong> {formatDate(selectedVoucher.startDate)} - {formatDate(selectedVoucher.endDate)}</div>
            <div><strong>Trạng thái:</strong> {selectedVoucher.status}</div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FormFields({ form, setForm }: { form: VoucherForm; setForm: Dispatch<SetStateAction<VoucherForm>> }) {
  return (
    <div className="khuyen-mai-page__form">
      <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Mã voucher" className="khuyen-mai-page__input" />
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên chương trình" className="khuyen-mai-page__input" />
      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as VoucherForm['type'] })} className="khuyen-mai-page__input">
        <option value="percentage">Phần trăm</option>
        <option value="fixed">Cố định</option>
      </select>
      <div className="khuyen-mai-page__form-grid">
        <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Giá trị" type="number" className="khuyen-mai-page__input" />
        <input value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="Giảm tối đa" type="number" className="khuyen-mai-page__input" />
      </div>
      <div className="khuyen-mai-page__form-grid">
        <input value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="Đơn tối thiểu" type="number" className="khuyen-mai-page__input" />
        <input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="Số lượng" type="number" className="khuyen-mai-page__input" />
      </div>
      <div className="khuyen-mai-page__form-grid">
        <input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} type="date" className="khuyen-mai-page__input" />
        <input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} type="date" className="khuyen-mai-page__input" />
      </div>
      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VoucherForm['status'] })} className="khuyen-mai-page__input">
        <option value="active">active</option>
        <option value="inactive">inactive</option>
        <option value="expired">expired</option>
      </select>
    </div>
  )
}

function Modal({
  title,
  onClose,
  onSubmit,
  hideSubmit = false,
  children,
}: {
  title: string
  onClose: () => void
  onSubmit?: () => void
  hideSubmit?: boolean
  children: ReactNode
}) {
  return (
    <div className="khuyen-mai-page__overlay" onClick={onClose}>
      <div className="khuyen-mai-page__modal" onClick={(e) => e.stopPropagation()}>
        <div className="khuyen-mai-page__modal-header">
          <h2 className="khuyen-mai-page__modal-title">{title}</h2>
          <button onClick={onClose} className="khuyen-mai-page__close">×</button>
        </div>
        {children}
        {!hideSubmit && onSubmit && (
          <div className="khuyen-mai-page__modal-actions">
            <button onClick={onClose} className="khuyen-mai-page__button khuyen-mai-page__button--secondary">Hủy</button>
            <button onClick={onSubmit} className="khuyen-mai-page__button khuyen-mai-page__button--primary">Lưu</button>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

export default Promo
