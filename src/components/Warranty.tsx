import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import Header from './Header'
import { api, type ApiDispute } from '../api'

function Warranty() {
  const [disputes, setDisputes] = useState<ApiDispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [tab, setTab] = useState<'all' | 'pending' | 'investigating' | 'resolved' | 'rejected'>('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.getDisputes()
        if (!cancelled) setDisputes(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tải tranh chấp')
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
    return disputes.filter((item) => {
      const matchesTerm =
        !term ||
        item.disputeCode.toLowerCase().includes(term) ||
        item.orderCode.toLowerCase().includes(term) ||
        item.customer.toLowerCase().includes(term)
      const matchesTab = tab === 'all' || item.status === tab
      return matchesTerm && matchesTab
    })
  }, [disputes, searchTerm, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const current = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const selectedDispute = selectedId ? disputes.find((item) => item.id === selectedId) ?? null : null

  const stats = [
    { label: 'Tổng tranh chấp', value: disputes.length, color: '#3b82f6' },
    { label: 'Chờ xử lý', value: disputes.filter((item) => item.status === 'pending').length, color: '#f59e0b' },
    { label: 'Đang xử lý', value: disputes.filter((item) => item.status === 'investigating').length, color: '#3b82f6' },
    { label: 'Đã giải quyết', value: disputes.filter((item) => item.status === 'resolved').length, color: '#10b981' },
  ]

  const updateStatus = async (status: 'pending' | 'investigating' | 'resolved' | 'rejected') => {
    if (!selectedDispute) return
    try {
      const updated = await api.updateDisputeStatus(selectedDispute.id, status)
      setDisputes((currentDisputes) => currentDisputes.map((item) => (item.id === selectedDispute.id ? updated : item)))
      setSelectedId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái')
    }
  }

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header title="KHIẾU NẠI & TRANH CHẤP" searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Tìm kiếm tranh chấp..." />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={statCardStyle}>
              <div style={{ color: stat.color, fontSize: '13px', fontWeight: 700 }}>{stat.label}</div>
              <div style={{ fontSize: '30px', fontWeight: 800, marginTop: '8px' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={panelStyle}>
          <div style={tabsStyle}>
            {[
              ['all', 'Tất cả'],
              ['pending', 'Chờ xử lý'],
              ['investigating', 'Đang xử lý'],
              ['resolved', 'Đã giải quyết'],
              ['rejected', 'Từ chối'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value as typeof tab)}
                style={{
                  ...tabButtonStyle,
                  background: tab === value ? '#0f1419' : 'transparent',
                  color: tab === value ? '#3b82f6' : '#8b92a7',
                  borderBottom: tab === value ? '2px solid #3b82f6' : '2px solid transparent',
                }}
              >
                {label} ({value === 'all' ? filtered.length : disputes.filter((item) => item.status === value).length})
              </button>
            ))}
          </div>

          <div style={toolbarStyle}>
            <div style={{ color: '#8b92a7' }}>{loading ? 'Đang tải...' : error || `Hiển thị ${filtered.length} tranh chấp`}</div>
          </div>

          <table style={tableStyle}>
            <thead>
              <tr style={headRowStyle}>
                <th style={thStyle}>Mã</th>
                <th style={thStyle}>Loại</th>
                <th style={thStyle}>Khách hàng</th>
                <th style={thStyle}>Số tiền</th>
                <th style={thStyle}>Ưu tiên</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && current.length === 0 ? (
                <tr>
                  <td colSpan={7} style={emptyCellStyle}>Không có tranh chấp nào</td>
                </tr>
              ) : (
                current.map((item) => (
                  <tr key={item.id} style={rowStyle}>
                    <td style={tdStyle}>
                      <div style={{ color: '#3b82f6', fontWeight: 700 }}>{item.disputeCode}</div>
                      <div style={mutedTextStyle}>Đơn {item.orderCode}</div>
                    </td>
                    <td style={tdStyle}><span style={typeBadge(item.type)}>{item.type}</span></td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700 }}>{item.customer}</div>
                      <div style={mutedTextStyle}>{item.shop}</div>
                    </td>
                    <td style={tdStyle}>{item.amount.toLocaleString('vi-VN')}đ</td>
                    <td style={tdStyle}><span style={priorityBadge(item.priority)}>{item.priority}</span></td>
                    <td style={tdStyle}><span style={statusBadge(item.status)}>{item.status}</span></td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button onClick={() => setSelectedId(item.id)} style={actionButtonStyle('#3b82f6')}>Xử lý</button>
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

      {selectedDispute && (
        <Modal title="Chi tiết tranh chấp" onClose={() => setSelectedId(null)} hideSubmit>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div><strong>Mã:</strong> {selectedDispute.disputeCode}</div>
            <div><strong>Đơn:</strong> {selectedDispute.orderCode}</div>
            <div><strong>Khách:</strong> {selectedDispute.customer}</div>
            <div><strong>Shop:</strong> {selectedDispute.shop}</div>
            <div><strong>Loại:</strong> {selectedDispute.type}</div>
            <div><strong>Lý do:</strong> {selectedDispute.reason}</div>
            <div><strong>Số tiền:</strong> {selectedDispute.amount.toLocaleString('vi-VN')}đ</div>
            <div><strong>Ưu tiên:</strong> {selectedDispute.priority}</div>
            <div><strong>Ngày tạo:</strong> {formatDate(selectedDispute.createdDate)}</div>
            <div><strong>Trạng thái:</strong> {selectedDispute.status}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              <button onClick={() => void updateStatus('investigating')} style={actionButtonStyle('#3b82f6')}>Đang xử lý</button>
              <button onClick={() => void updateStatus('resolved')} style={actionButtonStyle('#10b981')}>Đã giải quyết</button>
              <button onClick={() => void updateStatus('rejected')} style={actionButtonStyle('#ef4444')}>Từ chối</button>
            </div>
          </div>
        </Modal>
      )}
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
const toolbarStyle: CSSProperties = { padding: '16px 24px', borderBottom: '1px solid #2a2f3e', display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }
const tabsStyle: CSSProperties = { display: 'flex', borderBottom: '1px solid #2a2f3e', overflowX: 'auto' }
const tabButtonStyle: CSSProperties = { padding: '18px 28px', background: 'transparent', color: '#8b92a7', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: '15px', fontWeight: 600, whiteSpace: 'nowrap' }
const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const headRowStyle: CSSProperties = { background: '#0f1419', borderBottom: '1px solid #2a2f3e' }
const thStyle: CSSProperties = { padding: '16px 18px', textAlign: 'left', color: '#8b92a7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }
const tdStyle: CSSProperties = { padding: '16px 18px', color: '#cbd5e1', verticalAlign: 'middle' }
const rowStyle: CSSProperties = { borderBottom: '1px solid #2a2f3e' }
const emptyCellStyle: CSSProperties = { padding: '40px 28px', textAlign: 'center', color: '#8b92a7' }
const mutedTextStyle: CSSProperties = { color: '#6b7280', fontSize: '13px', marginTop: '4px' }
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

function typeBadge(type: string): CSSProperties {
  const color = type === 'refund' ? '#f59e0b' : type === 'return' ? '#3b82f6' : type === 'complaint' ? '#ef4444' : '#10b981'
  return { padding: '6px 12px', borderRadius: '999px', background: `${color}20`, color, fontWeight: 700, fontSize: '13px' }
}

function statusBadge(status: string): CSSProperties {
  const color = status === 'pending' ? '#f59e0b' : status === 'investigating' ? '#3b82f6' : status === 'resolved' ? '#10b981' : '#ef4444'
  return { padding: '6px 12px', borderRadius: '999px', background: `${color}20`, color, fontWeight: 700, fontSize: '13px' }
}

function priorityBadge(priority: string): CSSProperties {
  const color = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#10b981'
  return { padding: '6px 12px', borderRadius: '999px', background: `${color}20`, color, fontWeight: 700, fontSize: '13px' }
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

export default Warranty
