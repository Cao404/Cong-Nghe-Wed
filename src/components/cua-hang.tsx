import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api'
import '../styles/cua-hang.css'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const categoryMeta = {
  Laptop: { icon: '💻', gradient: 'linear-gradient(135deg, #7666ff 0%, #8f6be8 100%)' },
  'Điện thoại': { icon: '📱', gradient: 'linear-gradient(135deg, #ff8bd1 0%, #ff5b8c 100%)' },
  'Máy tính bảng': { icon: '📲', gradient: 'linear-gradient(135deg, #37b4ff 0%, #1ccfff 100%)' },
  'Phụ kiện': { icon: '🎧', gradient: 'linear-gradient(135deg, #3fe37a 0%, #32e9c0 100%)' },
} as const

function Shop() {
  const products = useStore((state) => state.products)
  const currentUser = useStore((state) => state.currentUser)
  const setCurrentUser = useStore((state) => state.setCurrentUser)
  const addPendingOrder = useStore((state) => state.addPendingOrder)
  const pendingOrders = useStore((state) => state.pendingOrders)
  const cancelOrder = useStore((state) => state.cancelOrder)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | keyof typeof categoryMeta>('all')
  const [cart, setCart] = useState<{ id: number; quantity: number }[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'shop' | 'cart' | 'checkout' | 'orders'>('shop')
  const [checkoutForm, setCheckoutForm] = useState({
    name: currentUser?.name || '',
    phone: '',
    email: currentUser?.email || '',
    address: '',
    city: 'Hà Nội',
    district: '',
    ward: '',
    note: '',
    paymentMethod: 'cod',
    shippingMethod: 'standard',
  })

  const itemsPerPage = 12
  const shippingFee = checkoutForm.shippingMethod === 'express' ? 50000 : 30000

  const categoryCards = useMemo(
    () =>
      (Object.keys(categoryMeta) as Array<keyof typeof categoryMeta>).map((name) => ({
        name,
        icon: categoryMeta[name].icon,
        count: products.filter((product) => product.category === name).length,
        gradient: categoryMeta[name].gradient,
      })),
    [products],
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch && product.stock > 0
    })
  }, [products, selectedCategory, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const productDetail = selectedProduct ? products.find((product) => product.id === selectedProduct) ?? null : null

  const cartItems = cart
    .map((item) => {
      const product = products.find((product) => product.id === item.id)
      if (!product) return null
      return { ...item, product }
    })
    .filter(Boolean) as Array<{ id: number; quantity: number; product: (typeof products)[number] }>

  const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const totalAmount = subtotal + shippingFee

  const myOrders = useMemo(
    () => pendingOrders.filter((order) => order.customerEmail === currentUser?.email),
    [currentUser?.email, pendingOrders],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedProduct(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const addToCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId)
      if (existing) {
        return prev.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { id: productId, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId))
      return
    }

    setCart((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const handleLogout = () => setCurrentUser(null)

  const handlePlaceOrder = async () => {
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!')
      return
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng đang trống!')
      return
    }

    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.image,
      }))

      const order = await api.createOrder({
        customerName: checkoutForm.name,
        customerEmail: checkoutForm.email,
        customerPhone: checkoutForm.phone,
        address: checkoutForm.address,
        city: checkoutForm.city,
        district: checkoutForm.district,
        items: orderItems,
        total: totalAmount,
        shippingFee,
        paymentMethod: checkoutForm.paymentMethod,
        note: checkoutForm.note,
      })

      addPendingOrder({
        id: order.id,
        orderCode: order.orderCode,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items.map((item) => ({
          productId: item.productId ?? item.id ?? 0,
          productName: item.productName ?? item.name ?? 'Sản phẩm',
          quantity: item.quantity,
          price: item.price,
          image: item.image ?? '',
        })),
        total: order.total,
        timestamp: order.createdAt ?? new Date().toISOString(),
        status: order.status,
      })

      alert(`Đặt hàng thành công!\n\nMã đơn: ${order.orderCode}\nTổng tiền: ${moneyFormatter.format(order.total)}`)
      setCart([])
      setViewMode('orders')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Đặt hàng thất bại')
    }
  }

  const topBar = (backTo?: 'shop' | 'cart') => (
    <div
      className="cua-hang-topbar"
      style={{
        background: 'linear-gradient(135deg, #6f76e6 0%, #7f4eb6 52%, #8a4aa0 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '22px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxShadow: '0 16px 40px rgba(22, 21, 47, 0.22)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div className="cua-hang-topbar__brand">
          <div style={{ fontSize: '28px', lineHeight: 1 }}>🛍️</div>
          <div>
<h1 className="cua-hang-topbar__title">Shop.vn</h1>
<p className="cua-hang-topbar__subtitle">
              Tìm kiếm phong cách hoàn hảo cho mọi dịp
            </p>
          </div>
          {backTo && (
            <button
              onClick={() => setViewMode(backTo)}
              style={{
                marginLeft: '8px',
                padding: '11px 16px',
                background: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: '14px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ← Quay lại
            </button>
          )}
        </div>

        <div className="cua-hang-topbar__actions">
          {viewMode === 'shop' && (
            <>
              <button
                onClick={() => setViewMode('orders')}
                style={{
                  padding: '13px 20px',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  color: '#fff',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  minWidth: '132px',
                }}
              >
                📦 Đơn hàng
              </button>
              <button
                onClick={() => setViewMode('cart')}
                style={{
                  padding: '13px 20px',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  color: '#fff',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  minWidth: '132px',
                }}
              >
                🛒 Giỏ hàng
              </button>
            </>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: '13px 20px',
              background: 'rgba(50, 34, 92, 0.7)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: 700,
              minWidth: '120px',
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )

  if (viewMode === 'cart') {
    return (
      <div className="cua-hang-page">
        {topBar('shop')}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
          {cartItems.length === 0 ? (
            <div
              style={{
                background: '#151a22',
                border: '1px solid #2a3140',
                borderRadius: '20px',
                padding: '56px 24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '56px', marginBottom: '12px' }}>🛒</div>
              <h2 style={{ margin: '0 0 10px', fontSize: '26px' }}>Giỏ hàng trống</h2>
              <p style={{ margin: '0 0 20px', color: '#8b92a7' }}>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
              <button
                onClick={() => setViewMode('shop')}
                style={{
                  padding: '12px 20px',
                  border: '1px solid #4b5568',
                  background: '#334155',
                  color: 'white',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: '24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      background: '#151a22',
                      border: '1px solid #2a3140',
                      borderRadius: '18px',
                      padding: '16px',
                    }}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: '112px', height: '112px', objectFit: 'cover', borderRadius: '14px', background: '#0d1117' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'white' }}>{item.product.name}</h3>
                      <div style={{ color: '#8fb7ff', fontWeight: 800, marginBottom: '12px' }}>{moneyFormatter.format(item.product.price)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: '36px',
                            height: '36px',
                            border: '1px solid #2a3140',
                            background: '#0d1117',
                            color: 'white',
                            borderRadius: '10px',
                            cursor: 'pointer',
                          }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: '36px',
                            height: '36px',
                            border: '1px solid #2a3140',
                            background: '#0d1117',
                            color: 'white',
                            borderRadius: '10px',
                            cursor: 'pointer',
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: '#151a22',
                  border: '1px solid #2a3140',
                  borderRadius: '18px',
                  padding: '20px',
                  height: 'fit-content',
                }}
              >
                <h3 style={{ marginTop: 0, color: 'white' }}>Tóm tắt đơn hàng</h3>
                <div style={{ display: 'grid', gap: '10px', color: '#9ca3af', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tạm tính</span>
                    <strong>{moneyFormatter.format(subtotal)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Phí giao hàng</span>
                    <strong>{moneyFormatter.format(shippingFee)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #2a3140', color: 'white' }}>
                    <span>Tổng cộng</span>
                    <strong>{moneyFormatter.format(totalAmount)}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setViewMode('checkout')}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    background: '#334155',
                    color: '#ffffff',
                    border: '1px solid #4b5568',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Tiếp tục thanh toán
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (viewMode === 'checkout') {
    return (
      <div className="cua-hang-page">
        {topBar('cart')}
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 0.7fr)', gap: '20px' }}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void handlePlaceOrder()
              }}
              style={{
                background: '#151a22',
                border: '1px solid #2a3140',
                borderRadius: '18px',
                padding: '24px',
                display: 'grid',
                gap: '16px',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '24px' }}>Thông tin giao hàng</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <Field label="Họ tên" htmlFor="checkout-name">
                  <input
                    id="checkout-name"
                    autoComplete="name"
                    value={checkoutForm.name}
                    onChange={(event) => setCheckoutForm({ ...checkoutForm, name: event.target.value })}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Số điện thoại" htmlFor="checkout-phone">
                  <input
                    id="checkout-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={checkoutForm.phone}
                    onChange={(event) => setCheckoutForm({ ...checkoutForm, phone: event.target.value })}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Email" htmlFor="checkout-email">
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  value={checkoutForm.email}
                  onChange={(event) => setCheckoutForm({ ...checkoutForm, email: event.target.value })}
                  style={inputStyle}
                />
              </Field>

              <Field label="Địa chỉ" htmlFor="checkout-address">
                <input
                  id="checkout-address"
                  autoComplete="street-address"
                  value={checkoutForm.address}
                  onChange={(event) => setCheckoutForm({ ...checkoutForm, address: event.target.value })}
                  style={inputStyle}
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <Field label="Thành phố" htmlFor="checkout-city">
                  <input
                    id="checkout-city"
                    autoComplete="address-level1"
                    value={checkoutForm.city}
                    onChange={(event) => setCheckoutForm({ ...checkoutForm, city: event.target.value })}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Quận / huyện" htmlFor="checkout-district">
                  <input
                    id="checkout-district"
                    autoComplete="address-level2"
                    value={checkoutForm.district}
                    onChange={(event) => setCheckoutForm({ ...checkoutForm, district: event.target.value })}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <Field label="Vận chuyển" htmlFor="checkout-shipping">
                  <select
                    id="checkout-shipping"
                    value={checkoutForm.shippingMethod}
                    onChange={(event) => setCheckoutForm({ ...checkoutForm, shippingMethod: event.target.value })}
                    style={inputStyle}
                  >
                    <option value="standard">Tiêu chuẩn - 30.000 ₫</option>
                    <option value="express">Nhanh - 50.000 ₫</option>
                  </select>
                </Field>
                <Field label="Thanh toán" htmlFor="checkout-payment">
                  <select
                    id="checkout-payment"
                    value={checkoutForm.paymentMethod}
                    onChange={(event) => setCheckoutForm({ ...checkoutForm, paymentMethod: event.target.value })}
                    style={inputStyle}
                  >
                    <option value="cod">Thanh toán khi nhận hàng</option>
                    <option value="bank">Chuyển khoản</option>
                  </select>
                </Field>
              </div>

              <Field label="Ghi chú" htmlFor="checkout-note">
                <textarea
                  id="checkout-note"
                  rows={4}
                  value={checkoutForm.note}
                  onChange={(event) => setCheckoutForm({ ...checkoutForm, note: event.target.value })}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                />
              </Field>

              <button
                type="submit"
                style={{
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, #7a73ea 0%, #7b4eb6 100%)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '15px',
                  boxShadow: '0 12px 28px rgba(122, 115, 234, 0.25)',
                }}
              >
                Xác nhận đặt hàng
              </button>
            </form>

            <aside
              style={{
                background: '#151a22',
                border: '1px solid #2a3140',
                borderRadius: '18px',
                padding: '24px',
                height: 'fit-content',
                position: 'sticky',
                top: '98px',
              }}
            >
              <h3 style={{ marginTop: 0, color: 'white' }}>Tóm tắt</h3>
              <div style={{ display: 'grid', gap: '10px', color: '#9ca3af' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sản phẩm</span>
                  <strong>{cartItems.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tạm tính</span>
                  <strong>{moneyFormatter.format(subtotal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Phí giao hàng</span>
                  <strong>{moneyFormatter.format(shippingFee)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #2a3140', color: 'white' }}>
                  <span>Tổng cộng</span>
                  <strong>{moneyFormatter.format(totalAmount)}</strong>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'orders') {
    return (
      <div className="cua-hang-page">
        {topBar('shop')}
        <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '24px', display: 'grid', gap: '16px' }}>
          {myOrders.length === 0 ? (
            <div
              style={{
                background: '#151a22',
                border: '1px solid #2a3140',
                borderRadius: '18px',
                padding: '32px',
                textAlign: 'center',
                color: '#8b92a7',
              }}
            >
              Chưa có đơn hàng nào.
            </div>
          ) : (
            myOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: '#151a22',
                  border: '1px solid #2a3140',
                  borderRadius: '18px',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'white', marginBottom: '4px' }}>{order.orderCode}</div>
                    <div style={{ color: '#8b92a7', fontSize: '14px' }}>
                      {order.customerName} · {order.customerEmail}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'white' }}>{moneyFormatter.format(order.total)}</div>
                    <div style={{ color: '#8b92a7', fontSize: '14px' }}>{String(order.status)}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {order.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '14px', gap: '12px' }}>
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span>{moneyFormatter.format(item.price)}</span>
                    </div>
                  ))}
                </div>
                {order.status === 'pending' && (
                  <div style={{ marginTop: '16px' }}>
                    <button
                      onClick={async () => {
                        if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
                        try {
                          await api.cancelOrder(order.id)
                          cancelOrder(order.id)
                        } catch (error) {
                          alert(error instanceof Error ? error.message : 'Hủy đơn thất bại')
                        }
                      }}
                      style={{
                        padding: '10px 14px',
                        background: '#2a1114',
                        color: '#fca5a5',
                        border: '1px solid #7f1d1d',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Hủy đơn
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="cua-hang-page">
      <div
        style={{
          background: 'linear-gradient(135deg, #6f76e6 0%, #7f4eb6 52%, #8a4aa0 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 28px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          boxShadow: '0 16px 40px rgba(22, 21, 47, 0.22)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 300px) minmax(320px, 1fr) auto',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <div style={{ fontSize: '30px' }}>🛍️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>Shop.vn</h1>
              <div style={{ color: 'rgba(255,255,255,0.76)', fontSize: '14px' }}>Mua sắm đơn giản, dễ nhìn hơn</div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setCurrentPage(1)
              }}
              style={{
                width: '100%',
                padding: '14px 16px 14px 18px',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.14)',
                color: 'white',
                outline: 'none',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>Xin chào, {currentUser?.name || 'Khách hàng'}</div>
            <button
              onClick={() => setViewMode('orders')}
              style={headerButtonStyle}
            >
              📦 Đơn hàng
            </button>
            <button
              onClick={() => setViewMode('cart')}
              style={headerButtonStyle}
            >
              🛒 Giỏ hàng
            </button>
            <button
              onClick={handleLogout}
              style={{
                ...headerButtonStyle,
                background: 'rgba(72, 46, 104, 0.88)',
                minWidth: '120px',
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="cua-hang-container">
<section className="cua-hang-page__section">
<div className="cua-hang-page__section-title">
            <h2 style={{ margin: '0 0 10px', fontSize: '44px', lineHeight: 1.1, letterSpacing: '-0.03em' }}>Danh Mục Sản Phẩm</h2>
            <p style={{ margin: 0, color: '#8b92a7', fontSize: '16px' }}>Tìm kiếm phong cách hoàn hảo cho mọi dịp</p>
          </div>

<div className="cua-hang-category-grid">
            {categoryCards.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  setSelectedCategory(category.name)
                  setCurrentPage(1)
                }}
                style={{
                  border: 'none',
                  background: category.gradient,
                  borderRadius: '24px',
                  padding: '28px 20px',
                  minHeight: '210px',
                  color: 'white',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 18px 34px rgba(8, 15, 40, 0.28)',
                }}
              >
<div className="cua-hang-category-icon">{category.icon}</div>
<div className="cua-hang-category-name">{category.name}</div>
                <div style={{ fontSize: '15px', opacity: 0.9 }}>{category.count} sản phẩm</div>
              </button>
            ))}
          </div>
        </section>

<section className="cua-hang-page__section cua-hang-page__section--compact">
<div className="cua-hang-header-row">
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: '30px' }}>Sản Phẩm Nổi Bật</h2>
              <div style={{ color: '#8b92a7' }}>Những sản phẩm được yêu thích nhất</div>
            </div>
          </div>

<div className="cua-hang-filter-row">
            <FilterChip active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>
              🏠 Tất cả
            </FilterChip>
            {categoryCards.map((category) => (
              <FilterChip
                key={category.name}
                active={selectedCategory === category.name}
                onClick={() => {
                  setSelectedCategory(category.name)
                  setCurrentPage(1)
                }}
              >
                {category.name}
              </FilterChip>
            ))}
          </div>

<div className="cua-hang-product-grid">
            {currentProducts.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  background: '#151a22',
                  border: '1px solid #2a3140',
                  borderRadius: '18px',
                  padding: '32px',
                  color: '#8b92a7',
                }}
              >
                Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              currentProducts.map((product) => (
                <article
                  key={product.id}
                  style={{
                    background: '#151a22',
                    border: '1px solid #2a3140',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 18px 32px rgba(0, 0, 0, 0.18)',
                  }}
                >
                  <button
                    onClick={() => setSelectedProduct(product.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
<div className="cua-hang-product-card__image-wrap">
                      <img
                        loading="lazy"
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', height: '230px', objectFit: 'cover', background: '#0d1117' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: '14px',
                          top: '14px',
                          padding: '7px 12px',
                          borderRadius: '999px',
                          background: 'rgba(79, 70, 229, 0.88)',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        {product.category}
                      </div>
                    </div>
<div className="cua-hang-product-card__body">
<h3 className="cua-hang-product-card__title">{product.name}</h3>
<div className="cua-hang-product-card__price">{moneyFormatter.format(product.price)}</div>
                      <div style={{ fontSize: '14px', color: '#8b92a7' }}>Còn {product.stock} sản phẩm</div>
                    </div>
                  </button>

<div className="cua-hang-product-card__footer">
                    <button
                      onClick={() => addToCart(product.id)}
                      style={{
                        width: '100%',
                        padding: '13px 14px',
                        background: 'linear-gradient(135deg, #7a73ea 0%, #7b4eb6 100%)',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        fontWeight: 800,
                        boxShadow: '0 10px 24px rgba(122, 115, 234, 0.18)',
                      }}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

<div className="cua-hang-pagination">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  border: page === currentPage ? '1px solid #8c85ef' : '1px solid #2a3140',
                  background: page === currentPage ? '#7a73ea' : '#151a22',
                  color: page === currentPage ? '#ffffff' : '#9ca3af',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </section>
      </div>

      {productDetail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-title"
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 10, 20, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 40,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(100%, 980px)',
              background: '#151a22',
              borderRadius: '22px',
              border: '1px solid #2a3140',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            }}
          >
            <img
              loading="lazy"
              src={productDetail.image}
              alt={productDetail.name}
              style={{ width: '100%', height: '100%', minHeight: '420px', objectFit: 'cover', background: '#0d1117' }}
            />
<div className="cua-hang-overlay__body">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Đóng chi tiết sản phẩm"
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '999px',
                  border: '1px solid #2a3140',
                  background: '#0d1117',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ×
              </button>
<div className="cua-hang-overlay__category">{productDetail.category}</div>
<h2 id="product-detail-title" className="cua-hang-overlay__title">
                {productDetail.name}
              </h2>
<div className="cua-hang-overlay__price">{moneyFormatter.format(productDetail.price)}</div>
<div className="cua-hang-overlay__meta">
                <div>
                  <strong>SKU:</strong> {productDetail.sku}
                </div>
                <div>
                  <strong>Tồn kho:</strong> {productDetail.stock}
                </div>
                <div>
                  <strong>Đã bán:</strong> {productDetail.sold}
                </div>
              </div>
<p className="cua-hang-overlay__desc">
                {productDetail.description || 'Sản phẩm chính hãng, mới 100%, phù hợp nhu cầu sử dụng hằng ngày.'}
              </p>
<div className="cua-hang-overlay__actions">
                <button
                  onClick={() => addToCart(productDetail.id)}
                  style={{
                    flex: '1 1 180px',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #7a73ea 0%, #7b4eb6 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  style={{
                    padding: '12px 16px',
                    background: '#0d1117',
                    color: '#9ca3af',
                    border: '1px solid #2a3140',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'grid', gap: '6px' }}>
<span className="cua-hang-field__label">{label}</span>
      {children}
    </label>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 16px',
        borderRadius: '999px',
        border: active ? '1px solid #8c85ef' : '1px solid #2a3140',
        background: active ? 'linear-gradient(135deg, #7a73ea 0%, #7b4eb6 100%)' : '#151a22',
        color: '#fff',
        cursor: 'pointer',
        fontWeight: 700,
        boxShadow: active ? '0 10px 20px rgba(122, 115, 234, 0.18)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  background: '#0d1117',
  border: '1px solid #2a3140',
  borderRadius: '12px',
  color: 'white',
  outline: 'none',
}

const headerButtonStyle: CSSProperties = {
  padding: '13px 18px',
  background: 'rgba(255,255,255,0.16)',
  border: '1px solid rgba(255,255,255,0.16)',
  color: '#fff',
  borderRadius: '16px',
  cursor: 'pointer',
  fontWeight: 800,
  minWidth: '110px',
}

export default Shop
