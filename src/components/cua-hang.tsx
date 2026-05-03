import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../api'
import { useStore } from '../store/useStore'
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

const categoryCardClassName = {
  Laptop: 'cua-hang-category-card cua-hang-category-card--laptop',
  'Điện thoại': 'cua-hang-category-card cua-hang-category-card--phone',
  'Máy tính bảng': 'cua-hang-category-card cua-hang-category-card--tablet',
  'Phụ kiện': 'cua-hang-category-card cua-hang-category-card--accessory',
} as const

type CategoryName = keyof typeof categoryMeta

type CartItem = { id: number; quantity: number }

type CheckoutForm = {
  name: string
  phone: string
  email: string
  address: string
  city: string
  district: string
  ward: string
  note: string
  paymentMethod: 'cod' | 'bank'
  shippingMethod: 'standard' | 'express'
}

const defaultCheckoutForm = (name = '', email = ''): CheckoutForm => ({
  name,
  phone: '',
  email,
  address: '',
  city: 'Hà Nội',
  district: '',
  ward: '',
  note: '',
  paymentMethod: 'cod',
  shippingMethod: 'standard',
})

function Shop() {
  const products = useStore((state) => state.products)
  const currentUser = useStore((state) => state.currentUser)
  const setCurrentUser = useStore((state) => state.setCurrentUser)
  const addPendingOrder = useStore((state) => state.addPendingOrder)
  const pendingOrders = useStore((state) => state.pendingOrders)
  const cancelOrder = useStore((state) => state.cancelOrder)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | CategoryName>('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'shop' | 'cart' | 'checkout' | 'orders'>('shop')
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>(() => defaultCheckoutForm(currentUser?.name || '', currentUser?.email || ''))

  const itemsPerPage = 12
  const shippingFee = checkoutForm.shippingMethod === 'express' ? 50000 : 30000

  useEffect(() => {
    setCheckoutForm((current) => ({
      ...current,
      name: currentUser?.name || current.name,
      email: currentUser?.email || current.email,
    }))
  }, [currentUser?.email, currentUser?.name])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProduct(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  const categoryCards = useMemo(
    () =>
      (Object.keys(categoryMeta) as CategoryName[]).map((name) => ({
        name,
        icon: categoryMeta[name].icon,
        count: products.filter((product) => product.category === name).length,
        gradient: categoryMeta[name].gradient,
      })),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesSearch = !term || product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)
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

  const myOrders = useMemo(() => pendingOrders.filter((order) => order.customerEmail === currentUser?.email), [currentUser?.email, pendingOrders])

  const addToCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId)
      if (existing) return prev.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
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
      setCheckoutForm(defaultCheckoutForm(currentUser?.name || '', currentUser?.email || ''))
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Đặt hàng thất bại')
    }
  }

  const topBar = (backTo?: 'shop' | 'cart') => (
    <div className="cua-hang-topbar">
      <div className="cua-hang-topbar__inner">
        <div className="cua-hang-topbar__brand">
          <div className="cua-hang-topbar__icon">🛍️</div>
          <div>
            <h1 className="cua-hang-topbar__title">Shop.vn</h1>
            <p className="cua-hang-topbar__subtitle">Tìm kiếm phong cách hoàn hảo cho mọi dịp</p>
          </div>
          {backTo && (
            <button onClick={() => setViewMode(backTo)} className="cua-hang-topbar__button cua-hang-topbar__button--back">
              ← Quay lại
            </button>
          )}
        </div>

        <div className="cua-hang-topbar__actions">
          {viewMode === 'shop' && (
            <>
              <button onClick={() => setViewMode('orders')} className="cua-hang-topbar__button">
                📦 Đơn hàng
              </button>
              <button onClick={() => setViewMode('cart')} className="cua-hang-topbar__button">
                🛒 Giỏ hàng
              </button>
            </>
          )}
          <button onClick={handleLogout} className="cua-hang-topbar__button cua-hang-topbar__button--logout">
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
        <div className="cua-hang-container">
          {cartItems.length === 0 ? (
            <div className="cua-hang-empty">
              <div className="cua-hang-empty__icon">🛒</div>
              <h2 className="cua-hang-empty__title">Giỏ hàng trống</h2>
              <p className="cua-hang-empty__text">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
              <button onClick={() => setViewMode('shop')} className="cua-hang-button">
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            <div className="cua-hang-grid-cart">
              <div className="cua-hang-stack">
                {cartItems.map((item) => (
                  <div key={item.id} className="cua-hang-card cua-hang-card--cart-item">
                    <img src={item.product.image} alt={item.product.name} className="cua-hang-cart-image" />
                    <div className="cua-hang-cart-content">
                      <h3 className="cua-hang-cart-title">{item.product.name}</h3>
                      <div className="cua-hang-cart-price">{moneyFormatter.format(item.product.price)}</div>
                      <div className="cua-hang-cart-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="cua-hang-qty-button">
                          -
                        </button>
                        <span className="cua-hang-qty-value">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="cua-hang-qty-button">
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cua-hang-card cua-hang-card--summary">
                <h3 className="cua-hang-summary-title">Tóm tắt đơn hàng</h3>
                <div className="cua-hang-summary-grid">
                  <div className="cua-hang-summary-row">
                    <span>Tạm tính</span>
                    <strong>{moneyFormatter.format(subtotal)}</strong>
                  </div>
                  <div className="cua-hang-summary-row">
                    <span>Phí giao hàng</span>
                    <strong>{moneyFormatter.format(shippingFee)}</strong>
                  </div>
                  <div className="cua-hang-summary-row cua-hang-summary-total">
                    <span>Tổng cộng</span>
                    <strong>{moneyFormatter.format(totalAmount)}</strong>
                  </div>
                </div>
                <button onClick={() => setViewMode('checkout')} className="cua-hang-submit cua-hang-submit--full">
                  Tiến hành thanh toán
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
        <div className="cua-hang-container cua-hang-container--checkout">
          <div className="cua-hang-checkout-grid">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void handlePlaceOrder()
              }}
              className="cua-hang-card cua-hang-card--checkout"
            >
              <h2 className="cua-hang-form-title">Thông tin giao hàng</h2>

              <div className="cua-hang-form-grid">
                <Field label="Họ tên" htmlFor="checkout-name">
                  <input id="checkout-name" autoComplete="name" value={checkoutForm.name} onChange={(event) => setCheckoutForm({ ...checkoutForm, name: event.target.value })} className="cua-hang-input" />
                </Field>
                <Field label="Số điện thoại" htmlFor="checkout-phone">
                  <input id="checkout-phone" type="tel" inputMode="tel" autoComplete="tel" value={checkoutForm.phone} onChange={(event) => setCheckoutForm({ ...checkoutForm, phone: event.target.value })} className="cua-hang-input" />
                </Field>
              </div>

              <Field label="Email" htmlFor="checkout-email">
                <input id="checkout-email" type="email" autoComplete="email" value={checkoutForm.email} onChange={(event) => setCheckoutForm({ ...checkoutForm, email: event.target.value })} className="cua-hang-input" />
              </Field>

              <Field label="Địa chỉ" htmlFor="checkout-address">
                <input id="checkout-address" autoComplete="street-address" value={checkoutForm.address} onChange={(event) => setCheckoutForm({ ...checkoutForm, address: event.target.value })} className="cua-hang-input" />
              </Field>

              <div className="cua-hang-form-grid">
                <Field label="Thành phố" htmlFor="checkout-city">
                  <input id="checkout-city" autoComplete="address-level1" value={checkoutForm.city} onChange={(event) => setCheckoutForm({ ...checkoutForm, city: event.target.value })} className="cua-hang-input" />
                </Field>
                <Field label="Quận / huyện" htmlFor="checkout-district">
                  <input id="checkout-district" autoComplete="address-level2" value={checkoutForm.district} onChange={(event) => setCheckoutForm({ ...checkoutForm, district: event.target.value })} className="cua-hang-input" />
                </Field>
              </div>

              <div className="cua-hang-form-grid">
                <Field label="Vận chuyển" htmlFor="checkout-shipping">
                  <select id="checkout-shipping" value={checkoutForm.shippingMethod} onChange={(event) => setCheckoutForm({ ...checkoutForm, shippingMethod: event.target.value as CheckoutForm['shippingMethod'] })} className="cua-hang-input">
                    <option value="standard">Tiêu chuẩn - 30.000 ₫</option>
                    <option value="express">Nhanh - 50.000 ₫</option>
                  </select>
                </Field>
                <Field label="Thanh toán" htmlFor="checkout-payment">
                  <select id="checkout-payment" value={checkoutForm.paymentMethod} onChange={(event) => setCheckoutForm({ ...checkoutForm, paymentMethod: event.target.value as CheckoutForm['paymentMethod'] })} className="cua-hang-input">
                    <option value="cod">Thanh toán khi nhận hàng</option>
                    <option value="bank">Chuyển khoản</option>
                  </select>
                </Field>
              </div>

              <Field label="Ghi chú" htmlFor="checkout-note">
                <textarea id="checkout-note" rows={4} value={checkoutForm.note} onChange={(event) => setCheckoutForm({ ...checkoutForm, note: event.target.value })} className="cua-hang-input cua-hang-input--textarea" />
              </Field>

              <button type="submit" className="cua-hang-submit">
                Xác nhận đặt hàng
              </button>
            </form>

            <aside className="cua-hang-card cua-hang-card--checkout-summary">
              <h3 className="cua-hang-summary-title">Tóm tắt</h3>
              <div className="cua-hang-summary-grid">
                <div className="cua-hang-summary-row">
                  <span>Sản phẩm</span>
                  <strong>{cartItems.length}</strong>
                </div>
                <div className="cua-hang-summary-row">
                  <span>Tạm tính</span>
                  <strong>{moneyFormatter.format(subtotal)}</strong>
                </div>
                <div className="cua-hang-summary-row">
                  <span>Phí giao hàng</span>
                  <strong>{moneyFormatter.format(shippingFee)}</strong>
                </div>
                <div className="cua-hang-summary-row cua-hang-summary-total">
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
        <div className="cua-hang-container cua-hang-container--orders">
          {myOrders.length === 0 ? (
            <div className="cua-hang-empty cua-hang-empty--orders">Chưa có đơn hàng nào.</div>
          ) : (
            myOrders.map((order) => (
              <div key={order.id} className="cua-hang-card cua-hang-card--orders">
                <div className="cua-hang-order-head">
                  <div>
                    <div className="cua-hang-order-code">{order.orderCode}</div>
                    <div className="cua-hang-order-meta">
                      {order.customerName} · {order.customerEmail}
                    </div>
                  </div>
                  <div className="cua-hang-order-total-wrap">
                    <div className="cua-hang-order-total">{moneyFormatter.format(order.total)}</div>
                    <div className="cua-hang-order-status">{String(order.status)}</div>
                  </div>
                </div>
                <div className="cua-hang-orders-grid">
                  {order.items.map((item, index) => (
                    <div key={index} className="cua-hang-order-row">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span>{moneyFormatter.format(item.price)}</span>
                    </div>
                  ))}
                </div>
                {order.status === 'pending' && (
                  <div className="cua-hang-order-actions">
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
                      className="cua-hang-order-cancel"
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
      {topBar()}
      <div className="cua-hang-container cua-hang-container--wide">
        <section className="cua-hang-page__section">
          <div className="cua-hang-page__section-title">
            <h2 className="cua-hang-page__title">Danh Mục Sản Phẩm</h2>
            <p className="cua-hang-page__subtitle">Tìm kiếm phong cách hoàn hảo cho mọi dịp</p>
          </div>

          <div className="cua-hang-category-grid">
            {categoryCards.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  setSelectedCategory(category.name)
                  setCurrentPage(1)
                }}
                className={categoryCardClassName[category.name]}
              >
                <div className="cua-hang-category-icon">{category.icon}</div>
                <div className="cua-hang-category-name">{category.name}</div>
                <div className="cua-hang-category-count">{category.count} sản phẩm</div>
              </button>
            ))}
          </div>
        </section>

        <section className="cua-hang-page__section cua-hang-page__section--compact">
          <div className="cua-hang-header-row">
            <div>
              <h2 className="cua-hang-header-title">Sản Phẩm Nổi Bật</h2>
              <div className="cua-hang-header-subtitle">Những sản phẩm được yêu thích nhất</div>
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

          <div className="cua-hang-search-row">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm kiếm sản phẩm, SKU..."
              className="cua-hang-search-input"
            />
          </div>

          <div className="cua-hang-product-grid">
            {currentProducts.length === 0 ? (
              <div className="cua-hang-product-empty">Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.</div>
            ) : (
              currentProducts.map((product) => (
                <article key={product.id} className="cua-hang-product-card">
                  <button onClick={() => setSelectedProduct(product.id)} className="cua-hang-product-card__button">
                    <div className="cua-hang-product-card__image-wrap">
                      <img loading="lazy" src={product.image} alt={product.name} className="cua-hang-product-card__image" />
                      <div className="cua-hang-product-card__badge">{product.category}</div>
                    </div>
                    <div className="cua-hang-product-card__body">
                      <h3 className="cua-hang-product-card__title">{product.name}</h3>
                      <div className="cua-hang-product-card__price">{moneyFormatter.format(product.price)}</div>
                      <div className="cua-hang-product-card__stock">Còn {product.stock} sản phẩm</div>
                    </div>
                  </button>
                  <div className="cua-hang-product-card__footer">
                    <button onClick={() => addToCart(product.id)} className="cua-hang-product-card__action">
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="cua-hang-pagination">
              <button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="cua-hang-pagination__button">
                ←
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`cua-hang-pagination__button ${currentPage === page ? 'cua-hang-pagination__button--active' : ''}`}
                >
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="cua-hang-pagination__button">
                →
              </button>
            </div>
          )}
        </section>
      </div>

      {productDetail && (
        <div role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onClick={() => setSelectedProduct(null)} className="cua-hang-overlay">
          <div onClick={(event) => event.stopPropagation()} className="cua-hang-overlay__modal">
            <img loading="lazy" src={productDetail.image} alt={productDetail.name} className="cua-hang-overlay__image" />
            <div className="cua-hang-overlay__body">
              <button type="button" onClick={() => setSelectedProduct(null)} aria-label="Đóng chi tiết sản phẩm" className="cua-hang-overlay__close">
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
                <button onClick={() => addToCart(productDetail.id)} className="cua-hang-overlay__action">
                  Thêm vào giỏ hàng
                </button>
                <button onClick={() => setSelectedProduct(null)} className="cua-hang-overlay__action cua-hang-overlay__action--secondary">
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
    <label htmlFor={htmlFor} className="cua-hang-field">
      <span className="cua-hang-field__label">{label}</span>
      {children}
    </label>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`cua-hang-filter-chip ${active ? 'cua-hang-filter-chip--active' : ''}`}>
      {children}
    </button>
  )
}

export default Shop
