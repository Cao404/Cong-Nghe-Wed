import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { api, type ApiOrderHistoryEntry } from '../api'
import { useStore } from '../store/useStore'
import Header from './Header'

function Orders() {
  const orders = useStore((state) => state.pendingOrders)
  const approveOrder = useStore((state) => state.approveOrder)
  const updateOrderStatus = useStore((state) => state.updateOrderStatus)
  const rejectOrder = useStore((state) => state.rejectOrder)

  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'shipping' | 'delivered' | 'rejected' | 'cancelled'>('all')
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [history, setHistory] = useState<ApiOrderHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesSearch =
          order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTab = activeTab === 'all' || order.status === activeTab
        return matchesSearch && matchesTab
      }),
    [orders, activeTab, searchTerm],
  )

  const tabs = [
    { id: 'all', label: 'Tất cả', count: orders.length },
    { id: 'pending', label: 'Chờ duyệt', count: orders.filter((order) => order.status === 'pending').length },
    { id: 'approved', label: 'Đã duyệt', count: orders.filter((order) => order.status === 'approved').length },
    { id: 'shipping', label: 'Đang giao', count: orders.filter((order) => order.status === 'shipping').length },
    { id: 'delivered', label: 'Đã giao', count: orders.filter((order) => order.status === 'delivered').length },
    { id: 'rejected', label: 'Từ chối', count: orders.filter((order) => order.status === 'rejected').length },
    { id: 'cancelled', label: 'Đã hủy', count: orders.filter((order) => order.status === 'cancelled').length },
  ] as const

  const syncStatus = async (id: number, status: 'approved' | 'shipping' | 'delivered' | 'rejected') => {
    const updated = await api.updateOrderStatus(id, status)
    updateOrderStatus(id, updated.status)
    if (selectedOrderId === id) {
      const refreshedHistory = await api.getOrderHistory(id)
      setHistory(refreshedHistory)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await api.approveOrder(id)
      approveOrder(id)
      if (selectedOrderId === id) {
        const refreshedHistory = await api.getOrderHistory(id)
        setHistory(refreshedHistory)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Duyệt đơn thất bại')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await api.rejectOrder(id)
      rejectOrder(id)
      if (selectedOrderId === id) {
        const refreshedHistory = await api.getOrderHistory(id)
        setHistory(refreshedHistory)
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Từ chối đơn thất bại')
    }
  }

  const handleAdvance = async (id: number, status: 'shipping' | 'delivered') => {
    try {
      await syncStatus(id, status)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái')
    }
  }

  const selectedOrder = selectedOrderId ? orders.find((order) => order.id === selectedOrderId) ?? null : null

  useEffect(() => {
    let cancelled = false

    const loadHistory = async () => {
      if (!selectedOrderId) {
        setHistory([])
        return
      }

      setHistoryLoading(true)
      try {
        const data = await api.getOrderHistory(selectedOrderId)
        if (!cancelled) {
          setHistory(data)
        }
      } catch (error) {
        if (!cancelled) {
          setHistory([])
          console.error('Failed to load order history:', error)
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false)
        }
      }
    }

    void loadHistory()

    return () => {
      cancelled = true
    }
  }, [selectedOrderId])

  return (
    <div style={{ color: 'white', minHeight: '100vh' }}>
      <Header
        title="QUẢN LÝ ĐƠN HÀNG"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Tìm kiếm đơn hàng..."
      />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                borderRadius: '999px',
                border: activeTab === tab.id ? '1px solid #8c85ef' : '1px solid #2a3140',
                background: activeTab === tab.id ? '#7a73ea' : '#151a22',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div style={{ background: '#1a1f2e', border: '1px solid #2a2f3e', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1419', borderBottom: '1px solid #2a2f3e' }}>
                <th style={thStyle}>Mã đơn</th>
                <th style={thStyle}>Khách hàng</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Sản phẩm</th>
                <th style={thStyle}>Tổng tiền</th>
                <th style={thStyle}>Thời gian</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Trạng thái</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #2a2f3e' }}>
                  <td style={tdStyle}>{order.orderCode}</td>
                  <td style={tdStyle}>
                    <div style={{ color: 'white', fontWeight: 700 }}>{order.customerName}</div>
                    <div style={{ color: '#8b92a7', fontSize: '13px' }}>{order.customerEmail}</div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{order.items.length}</td>
                  <td style={tdStyle}>{money(order.total)}</td>
                  <td style={tdStyle}>{new Date(order.timestamp).toLocaleString('vi-VN')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={statusBadge(order.status)}>{statusText(order.status)}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={() => setSelectedOrderId(order.id)} style={actionButton('#3b82f6')}>Chi tiết</button>
                      {order.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(order.id)} style={actionButton('#10b981')}>Duyệt</button>
                          <button onClick={() => handleReject(order.id)} style={actionButton('#ef4444')}>Từ chối</button>
                        </>
                      )}
                      {order.status === 'approved' && (
                        <button onClick={() => void handleAdvance(order.id, 'shipping')} style={actionButton('#3b82f6')}>
                          Đang giao
                        </button>
                      )}
                      {order.status === 'shipping' && (
                        <button onClick={() => void handleAdvance(order.id, 'delivered')} style={actionButton('#14b8a6')}>
                          Đã giao
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 2000,
          }}
          onClick={() => setSelectedOrderId(null)}
        >
          <div
            style={{
              width: 'min(100%, 920px)',
              maxHeight: '90vh',
              overflow: 'hidden',
              background: '#1a1f2e',
              border: '1px solid #2a2f3e',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid #2a2f3e', display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '22px', color: 'white' }}>Chi tiết đơn hàng</h2>
                <div style={{ marginTop: '8px', color: '#8b92a7' }}>
                  {selectedOrder.orderCode} · {statusText(selectedOrder.status)}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid #2a2f3e',
                  background: '#0f1419',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', display: 'grid', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <InfoCard label="Khách hàng" value={selectedOrder.customerName} subValue={selectedOrder.customerEmail} />
                <InfoCard label="Tổng tiền" value={money(selectedOrder.total)} subValue={new Date(selectedOrder.timestamp).toLocaleString('vi-VN')} />
                <InfoCard label="Trạng thái" value={statusText(selectedOrder.status)} subValue={selectedOrder.orderCode} />
              </div>

              <section style={panelStyle}>
                <div style={sectionTitleStyle}>Lịch sử xử lý</div>
                {historyLoading ? (
                  <div style={emptyStateStyle}>Đang tải lịch sử...</div>
                ) : history.length === 0 ? (
                  <div style={emptyStateStyle}>Chưa có lịch sử xử lý.</div>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {history.map((entry) => (
                      <div key={entry.id} style={historyItemStyle}>
                        <div>
                          <div style={{ color: 'white', fontWeight: 700, marginBottom: '4px' }}>{entry.actorName}</div>
                          <div style={{ color: '#8b92a7', fontSize: '13px' }}>{entry.note || historyActionLabel(entry.action)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#3b82f6', fontWeight: 700, marginBottom: '4px' }}>{entry.toStatus ? statusText(entry.toStatus) : historyActionLabel(entry.action)}</div>
                          <div style={{ color: '#8b92a7', fontSize: '12px' }}>{new Date(entry.createdAt).toLocaleString('vi-VN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section style={panelStyle}>
                <div style={sectionTitleStyle}>Sản phẩm</div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} style={lineItemStyle}>
                      <div>
                        <div style={{ color: 'white', fontWeight: 700 }}>{item.productName}</div>
                        <div style={{ color: '#8b92a7', fontSize: '13px' }}>Số lượng: {item.quantity}</div>
                      </div>
                      <div style={{ color: '#f97316', fontWeight: 700 }}>{money(item.price)}</div>
                    </div>
                  ))}
                </div>
              </section>

              {selectedOrder.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => handleReject(selectedOrder.id)} style={actionButton('#ef4444')}>Từ chối</button>
                  <button onClick={() => handleApprove(selectedOrder.id)} style={actionButton('#10b981')}>Duyệt đơn</button>
                </div>
              )}
              {selectedOrder.status === 'approved' && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => void handleAdvance(selectedOrder.id, 'shipping')} style={actionButton('#3b82f6')}>
                    Chuyển sang đang giao
                  </button>
                </div>
              )}
              {selectedOrder.status === 'shipping' && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button onClick={() => void handleAdvance(selectedOrder.id, 'delivered')} style={actionButton('#14b8a6')}>
                    Xác nhận đã giao
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

  function statusBadge(status: string): CSSProperties {
  const colorMap: Record<string, string> = {
    pending: '#f97316',
    approved: '#10b981',
    shipping: '#3b82f6',
    delivered: '#14b8a6',
    rejected: '#ef4444',
    cancelled: '#6b7280',
  }

  const color = colorMap[status] ?? '#6b7280'

  return {
    padding: '6px 12px',
    borderRadius: '999px',
    background: `${color}20`,
    color,
    fontWeight: 700,
    fontSize: '13px',
  }
}

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    rejected: 'Từ chối',
    cancelled: 'Đã hủy',
  }

  return map[status] ?? status
}

function historyActionLabel(action: string) {
  const map: Record<string, string> = {
    created: 'Tạo đơn hàng',
    approved: 'Duyệt đơn hàng',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    rejected: 'Từ chối đơn hàng',
    cancelled: 'Hủy đơn hàng',
  }

  return map[action] ?? action
}

function money(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function InfoCard({
  label,
  value,
  subValue,
}: {
  label: string
  value: string
  subValue?: string
}) {
  return (
    <div style={panelStyle}>
      <div style={{ color: '#8b92a7', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{label}</div>
      <div style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: subValue ? '6px' : 0 }}>{value}</div>
      {subValue && <div style={{ color: '#8b92a7', fontSize: '13px' }}>{subValue}</div>}
    </div>
  )
}

const panelStyle: CSSProperties = {
  background: '#151a22',
  border: '1px solid #2a2f3e',
  borderRadius: '14px',
  padding: '18px',
}

const sectionTitleStyle: CSSProperties = {
  color: 'white',
  fontWeight: 700,
  marginBottom: '14px',
  fontSize: '16px',
}

const emptyStateStyle: CSSProperties = {
  color: '#8b92a7',
  padding: '18px 0',
}

const historyItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '14px',
  borderRadius: '12px',
  background: '#0f1419',
  border: '1px solid #2a2f3e',
}

const lineItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '14px',
  borderRadius: '12px',
  background: '#0f1419',
  border: '1px solid #2a2f3e',
}

export default Orders
