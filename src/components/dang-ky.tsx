import { useState } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api'
import '../styles/dang-ky.css'

interface RegisterProps {
  onBackToLogin: () => void
}

function Register({ onBackToLogin }: RegisterProps) {
  const setCurrentUser = useStore((state) => state.setCurrentUser)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ')
      return
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại phải có 10 chữ số')
      return
    }

    try {
      const response = await api.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })

      setCurrentUser(response.user, response.token)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đăng ký thất bại')
    }
  }

  return (
    <div className="dang-ky-page">
      <div className="dang-ky-page__card">
        <div className="dang-ky-page__header">
          <h1 className="dang-ky-page__title">
            Shop.vn
          </h1>
          <p className="dang-ky-page__subtitle">Đăng ký tài khoản mới</p>
        </div>

        {error && (
          <div className="dang-ky-page__error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="dang-ky-page__group">
            <label className="dang-ky-page__label">
              Họ và tên
            </label>
            <input
              className="dang-ky-page__input"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập họ và tên"
              onFocus={(e) => (e.currentTarget.style.borderColor = '#475569')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2f3e')}
            />
          </div>

          <div className="dang-ky-page__group">
            <label className="dang-ky-page__label">
              Email
            </label>
            <input
              className="dang-ky-page__input"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Nhập email"
              onFocus={(e) => (e.currentTarget.style.borderColor = '#475569')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2f3e')}
            />
          </div>

          <div className="dang-ky-page__group">
            <label className="dang-ky-page__label">
              Số điện thoại
            </label>
            <input
              className="dang-ky-page__input"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Nhập số điện thoại"
              onFocus={(e) => (e.currentTarget.style.borderColor = '#475569')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2f3e')}
            />
          </div>

          <div className="dang-ky-page__group">
            <label className="dang-ky-page__label">
              Mật khẩu
            </label>
            <input
              className="dang-ky-page__input"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              onFocus={(e) => (e.currentTarget.style.borderColor = '#475569')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2f3e')}
            />
          </div>

          <div className="dang-ky-page__group dang-ky-page__group--large">
            <label className="dang-ky-page__label">
              Xác nhận mật khẩu
            </label>
            <input
              className="dang-ky-page__input"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu"
              onFocus={(e) => (e.currentTarget.style.borderColor = '#475569')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2f3e')}
            />
          </div>

          <button
            type="submit"
            className="dang-ky-page__submit"
            onMouseEnter={(e) => e.currentTarget.style.background = '#ea580c'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f97316'}
          >
            Đăng ký
          </button>

          <div className="dang-ky-page__footer">
            <span className="dang-ky-page__footer-text">Đã có tài khoản? </span>
            <button
              type="button"
              onClick={onBackToLogin}
              className="dang-ky-page__back"
            >
              Đăng nhập ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
