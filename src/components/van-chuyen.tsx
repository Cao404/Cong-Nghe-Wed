import { useEffect, useMemo, useState, type CSSProperties, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import Header from './Header'
import '../styles/van-chuyen.css'
import { api, type ApiShippingPartner } from '../api'

type PartnerForm = {
  name: string
  code: string
  logo: string
  type: 'express' | 'standard' | 'economy'
  fee: string
  avgDeliveryTime: string
  contact: string
  status: 'active' | 'inactive'
}

const emptyForm: PartnerForm = {
  name: '',
  code: '',
  logo: '🚚',
  type: 'express',
  fee: '',
  avgDeliveryTime: '',
  contact: '',
  status: 'active',
}

function Shipping() {
  const [partners, setPartners] = useState<ApiShippingPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'express' | 'standard' | 'economy'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<PartnerForm>(emptyForm)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.getShippingPartners()
        if (!cancelled) setPartners(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tải đối tác vận chuyển')
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
    return partners.filter((partner) => {
      const matchesTerm = !term || partner.name.toLowerCase().includes(term) || partner.code.toLowerCase().includes(term)
      const matchesType = typeFilter === 'all' || partner.type === typeFilter
      const matchesStatus = statusFilter === 'all' || partner.status === statusFilter
      return matchesTerm && matchesType && matchesStatus
    })
  }, [partners, searchTerm, statusFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const current = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const selectedPartner = selectedId ? partners.find((partner) => partner.id === selectedId) ?? null : null

  const stats = [
    { label: 'Tổng đối tác', value: partners.length, color: '#3b82f6' },
    { label: 'Đang hoạt động', value: partners.filter((partner) => partner.status === 'active').length, color: '#10b981' },
    { label: 'Tạm dừng', value: partners.filter((partner) => partner.status === 'inactive').length, color: '#6b7280' },
    { label: 'Giao nhanh', value: partners.filter((partner) => partner.type === 'express').length, color: '#ef4444' },
  ]

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (partner: ApiShippingPartner) => {
    setEditingId(partner.id)
    setSelectedId(partner.id)
    setForm({
      name: partner.name,
      code: partner.code,
      logo: partner.logo,
      type: partner.type === 'economy' || partner.type === 'standard' ? partner.type : 'express',
      fee: String(partner.fee),
      avgDeliveryTime: String(partner.avgDeliveryTime),
      contact: partner.contact,
      status: partner.status === 'inactive' ? 'inactive' : 'active',
    })
    setShowForm(true)
  }

  const submit = async () => {
    if (!form.name || !form.code || !form.fee || !form.avgDeliveryTime || !form.contact) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    try {
      const payload = {
        name: form.name,
        code: form.code,
        logo: form.logo,
        type: form.type,
        fee: Number(form.fee),
        avgDeliveryTime: Number(form.avgDeliveryTime),
        contact: form.contact,
        status: form.status,
      }

      if (editingId) {
        const updated = await api.updateShippingPartner(editingId, payload)
        setPartners((currentPartners) => currentPartners.map((partner) => (partner.id === editingId ? updated : partner)))
      } else {
        const created = await api.createShippingPartner(payload)
        setPartners((currentPartners) => [created, ...currentPartners])
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể lưu đối tác')
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa đối tác này?')) return
    try {
      await api.deleteShippingPartner(id)
      setPartners((currentPartners) => currentPartners.filter((partner) => partner.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa đối tác')
    }
  }

  const toggleStatus = async (partner: ApiShippingPartner) => {
    const nextStatus = partner.status === 'active' ? 'inactive' : 'active'
    try {
      const updated = await api.updateShippingPartner(partner.id, { status: nextStatus })
      setPartners((currentPartners) => currentPartners.map((item) => (item.id === partner.id ? updated : item)))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái')
    }
  }

  return (
    <div className="van-chuyen-page">
      <Header title="VẬN CHUYỂN & ĐỐI TÁC" searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Tìm kiếm đối tác..." />

      <div className="van-chuyen-page__content">
        <div className="van-chuyen-page__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="van-chuyen-page__stat" style={statCardStyle}>
              <div style={{ color: stat.color, fontSize: '13px', fontWeight: 700 }}>{stat.label}</div>
              <div style={{ fontSize: '30px', fontWeight: 800, marginTop: '8px' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="van-chuyen-page__panel" style={panelStyle}>
          <div className="van-chuyen-page__toolbar" style={toolbarStyle}>
            <div style={{ color: '#8b92a7' }}>{loading ? 'Đang tải...' : error || `Hiển thị ${filtered.length} đối tác`}</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} style={selectStyle}>
                <option value="all">Tất cả loại</option>
                <option value="express">Nhanh</option>
                <option value="standard">Tiêu chuẩn</option>
                <option value="economy">Tiết kiệm</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} style={selectStyle}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
              <button onClick={openCreate} style={primaryButtonStyle}>+ Thêm đối tác</button>
            </div>
          </div>

          <table style={tableStyle}>
            <thead>
              <tr style={headRowStyle}>
                <th style={thStyle}>Đối tác</th>
                <th style={thStyle}>Loại</th>
                <th style={thStyle}>Đơn hàng</th>
                <th style={thStyle}>Tỷ lệ</th>
                <th style={thStyle}>Thời gian</th>
                <th style={thStyle}>Phí ship</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && current.length === 0 ? (
                <tr>
                  <td colSpan={8} style={emptyCellStyle}>Không có đối tác nào</td>
                </tr>
              ) : (
                current.map((partner) => (
                  <tr key={partner.id} style={rowStyle}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={logoStyle}>{partner.logo}</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{partner.name}</div>
                          <div style={mutedTextStyle}>{partner.code} • {partner.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}><span style={typeBadge(partner.type)}>{partner.type}</span></td>
                    <td style={tdStyle}>{partner.totalOrders.toLocaleString('vi-VN')}</td>
                    <td style={tdStyle}>{partner.successRate}%</td>
                    <td style={tdStyle}>{partner.avgDeliveryTime} ngày</td>
                    <td style={tdStyle}>{partner.fee.toLocaleString('vi-VN')}đ</td>
                    <td style={tdStyle}><span style={statusBadge(partner.status)}>{partner.status}</span></td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => openEdit(partner)} style={actionButtonStyle('#3b82f6')}>Cấu hình</button>
                        <button onClick={() => toggleStatus(partner)} style={actionButtonStyle('#10b981')}>
                          {partner.status === 'active' ? 'Tắt' : 'Bật'}
                        </button>
                        <button onClick={() => remove(partner.id)} style={actionButtonStyle('#ef4444')}>Xóa</button>
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
        <Modal title={editingId ? 'Chỉnh sửa đối tác' : 'Thêm đối tác mới'} onClose={() => setShowForm(false)} onSubmit={submit}>
          <FormFields form={form} setForm={setForm} />
        </Modal>
      )}

      {selectedPartner && !showForm && (
        <Modal title="Chi tiết đối tác" onClose={() => setSelectedId(null)} hideSubmit>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div><strong>Tên:</strong> {selectedPartner.name}</div>
            <div><strong>Mã:</strong> {selectedPartner.code}</div>
            <div><strong>Loại:</strong> {selectedPartner.type}</div>
            <div><strong>Trạng thái:</strong> {selectedPartner.status}</div>
            <div><strong>Đơn hàng:</strong> {selectedPartner.totalOrders}</div>
            <div><strong>Tỷ lệ thành công:</strong> {selectedPartner.successRate}%</div>
            <div><strong>Thời gian giao:</strong> {selectedPartner.avgDeliveryTime} ngày</div>
            <div><strong>Phí ship:</strong> {selectedPartner.fee.toLocaleString('vi-VN')}đ</div>
            <div><strong>Liên hệ:</strong> {selectedPartner.contact}</div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FormFields({ form, setForm }: { form: PartnerForm; setForm: Dispatch<SetStateAction<PartnerForm>> }) {
  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên đối tác" style={inputStyle} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Mã" style={inputStyle} />
        <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="Logo" style={inputStyle} />
      </div>
      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PartnerForm['type'] })} style={inputStyle}>
        <option value="express">express</option>
        <option value="standard">standard</option>
        <option value="economy">economy</option>
      </select>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <input value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="Phí ship" type="number" style={inputStyle} />
        <input value={form.avgDeliveryTime} onChange={(e) => setForm({ ...form, avgDeliveryTime: e.target.value })} placeholder="Thời gian giao" type="number" step="0.1" style={inputStyle} />
      </div>
      <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Liên hệ" style={inputStyle} />
      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PartnerForm['status'] })} style={inputStyle}>
        <option value="active">active</option>
        <option value="inactive">inactive</option>
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
const inputStyle: CSSProperties = { width: '100%', padding: '12px', background: '#0f1419', border: '1px solid #2a2f3e', borderRadius: '8px', color: 'white', fontSize: '15px' }

function typeBadge(type: string): CSSProperties {
  const color = type === 'express' ? '#ef4444' : type === 'economy' ? '#10b981' : '#3b82f6'
  return { padding: '6px 12px', borderRadius: '999px', background: `${color}20`, color, fontWeight: 700, fontSize: '13px' }
}

function statusBadge(status: string): CSSProperties {
  const color = status === 'active' ? '#10b981' : '#6b7280'
  return { padding: '6px 12px', borderRadius: '999px', background: `${color}20`, color, fontWeight: 700, fontSize: '13px' }
}

const logoStyle: CSSProperties = { width: '48px', height: '48px', borderRadius: '12px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }

export default Shipping
