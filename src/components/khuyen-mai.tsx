import { useEffect, useMemo, useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from 'react'
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
    { label: 'Tổng voucher', value: vouchers.length, color: '#3b82f6' },
    { label: 'Đang hoạt động', value: vouchers.filter((voucher) => voucher.status === 'active').length, color: '#10b981' },
    { label: 'Tạm dừng', value: vouchers.filter((voucher) => voucher.status === 'inactive').length, color: '#6b7280' },
    { label: 'Hết hạn', value: vouchers.filter((voucher) => voucher.status === 'expired').length, color: '#ef4444' },
  ]

  const openCreate = () => {
    setEditingId(null)
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
            <div key={stat.label} className="khuyen-mai-page__stat" style={statCardStyle}>
              <div style={{ color: stat.color, fontSize: '13px', fontWeight: 700 }}>{stat.label}</div>
              <div style={{ fontSize: '30px', fontWeight: 800, marginTop: '8px' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="khuyen-mai-page__panel" style={panelStyle}>
          <div className="khuyen-mai-page__toolbar" style={toolbarStyle}>
            <div style={{ color: '#8b92a7' }}>{loading ? 'Đang tải...' : error || `Hiển thị ${filtered.length} voucher`}</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} style={selectStyle}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
                <option value="expired">Hết hạn</option>
              </select>
              <button onClick={openCreate} style={primaryButtonStyle}>+ Tạo Voucher</button>
            </div>
          </div>

          <table className="khuyen-mai-page__table" style={tableStyle}>
            <thead>
              <tr style={headRowStyle}>
                <th style={thStyle}>Mã</th>
                <th style={thStyle}>Tên</th>
                <th style={thStyle}>Giảm giá</th>
                <th style={thStyle}>Số lượng</th>
                <th style={thStyle}>Thời gian</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && current.length === 0 ? (
                <tr>
                  <td colSpan={7} style={emptyCellStyle}>Không có voucher nào</td>
                </tr>
              ) : (
                current.map((voucher) => (
                  <tr key={voucher.id} style={rowStyle}>
                    <td style={tdStyle}><strong style={{ color: '#f97316' }}>{voucher.code}</strong></td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700 }}>{voucher.name}</div>
                      <div style={mutedTextStyle}>Đơn tối thiểu: {voucher.minOrder.toLocaleString('vi-VN')}đ</div>
                    </td>
                    <td style={tdStyle}>
                      {voucher.type === 'fixed' ? `${voucher.value.toLocaleString('vi-VN')}đ` : `${voucher.value}%`}
                      <div style={mutedTextStyle}>Tối đa {voucher.maxDiscount.toLocaleString('vi-VN')}đ</div>
                    </td>
                    <td style={tdStyle}>{voucher.used}/{voucher.quantity}</td>
                    <td style={tdStyle}>
                      <div>{formatDate(voucher.startDate)}</div>
                      <div style={mutedTextStyle}>{formatDate(voucher.endDate)}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(voucher.status)}>{voucher.status}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => openEdit(voucher)} style={actionButtonStyle('#3b82f6')}>Sửa</button>
                        <button onClick={() => toggleStatus(voucher)} style={actionButtonStyle('#10b981')}>
                          {voucher.status === 'active' ? 'Tắt' : 'Bật'}
                        </button>
                        <button onClick={() => remove(voucher.id)} style={actionButtonStyle('#ef4444')}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={paginationStyle}>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} style={pageButtonStyle(currentPage === 1)}>←</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} style={{ ...pageButtonStyle(false), background: currentPage === page ? '#f97316' : '#2a2f3e' }}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={pageButtonStyle(currentPage === totalPages)}>→</button>
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
          <div style={{ display: 'grid', gap: '10px' }}>
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
    <div style={{ display: 'grid', gap: '14px' }}>
      <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Mã voucher" style={inputStyle} />
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên chương trình" style={inputStyle} />
      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as VoucherForm['type'] })} style={inputStyle}>
        <option value="percentage">Phần trăm</option>
        <option value="fixed">Cố định</option>
      </select>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Giá trị" type="number" style={inputStyle} />
        <input value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="Giảm tối đa" type="number" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <input value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="Đơn tối thiểu" type="number" style={inputStyle} />
        <input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="Số lượng" type="number" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} type="date" style={inputStyle} />
        <input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} type="date" style={inputStyle} />
      </div>
      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VoucherForm['status'] })} style={inputStyle}>
        <option value="active">active</option>
        <option value="inactive">inactive</option>
        <option value="expired">expired</option>
      </select>
    </div>
  )
}

function Modal({ title, onClose, onSubmit, hideSubmit = false, children }: { title: string; onClose: () => void; onSubmit?: () => void; hideSubmit?: boolean; children: ReactNode }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>
        {children}
        {!hideSubmit && onSubmit && (
          <div style={modalActionsStyle}>
            <button onClick={onClose} style={secondaryButtonStyle}>Hủy</button>
            <button onClick={onSubmit} style={primaryButtonStyle}>Lưu</button>
          </div>
        )}
      </div>
    </div>
  )
}

const panelStyle: CSSProperties = { background: '#1a1f2e', borderRadius: '12px', border: '1px solid #2a2f3e', overflow: 'hidden' }
const statCardStyle: CSSProperties = { background: '#1a1f2e', padding: '24px', borderRadius: '12px', border: '1px solid #2a2f3e' }
const toolbarStyle: CSSProperties = { padding: '20px 24px', borderBottom: '1px solid #2a2f3e', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }
const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const headRowStyle: CSSProperties = { background: '#0f1419', borderBottom: '1px solid #2a2f3e' }
const thStyle: CSSProperties = { padding: '16px 18px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }
const tdStyle: CSSProperties = { padding: '16px 18px', color: '#cbd5e1', verticalAlign: 'middle' }
const rowStyle: CSSProperties = { borderBottom: '1px solid #2a2f3e' }
const emptyCellStyle: CSSProperties = { padding: '40px 28px', textAlign: 'center', color: '#8b92a7' }
const mutedTextStyle: CSSProperties = { color: '#6b7280', fontSize: '13px', marginTop: '4px' }
const selectStyle: CSSProperties = { padding: '8px 12px', background: '#0f1419', border: '1px solid #2a2f3e', borderRadius: '6px', color: 'white', fontSize: '13px', cursor: 'pointer' }
const inputStyle: CSSProperties = { width: '100%', padding: '12px', background: '#0f1419', border: '1px solid #2a2f3e', borderRadius: '8px', color: 'white', fontSize: '15px' }
const primaryButtonStyle: CSSProperties = { padding: '10px 16px', borderRadius: '10px', border: 'none', background: '#f97316', color: 'white', cursor: 'pointer', fontWeight: 700 }
const secondaryButtonStyle: CSSProperties = { padding: '10px 16px', borderRadius: '10px', border: '1px solid #2a2f3e', background: '#0f1419', color: 'white', cursor: 'pointer', fontWeight: 700 }
const actionButtonStyle = (color: string): CSSProperties => ({ padding: '8px 12px', borderRadius: '8px', border: 'none', background: color, color: 'white', cursor: 'pointer', fontWeight: 700 })
const paginationStyle: CSSProperties = { padding: '20px 24px', borderTop: '1px solid #2a2f3e', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }
const pageButtonStyle = (disabled: boolean): CSSProperties => ({ padding: '8px 12px', background: disabled ? '#1a1f2e' : '#2a2f3e', color: disabled ? '#6b7280' : 'white', border: '1px solid #2a2f3e', borderRadius: '6px', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '14px' })
const overlayStyle: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }
const modalStyle: CSSProperties = { background: '#1a1f2e', borderRadius: '16px', width: 'min(100%, 640px)', border: '1px solid #2a2f3e', padding: '24px' }
const modalHeaderStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }
const modalActionsStyle: CSSProperties = { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }
const closeButtonStyle: CSSProperties = { width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #2a2f3e', background: '#0f1419', color: 'white', cursor: 'pointer', fontSize: '20px' }

function badgeStyle(status: string): CSSProperties {
  const color = status === 'active' ? '#10b981' : status === 'expired' ? '#ef4444' : '#6b7280'
  return { padding: '6px 12px', borderRadius: '999px', background: `${color}20`, color, fontWeight: 700, fontSize: '13px' }
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

export default Promo
