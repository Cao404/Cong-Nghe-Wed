import { useState } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api'

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f1419',
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1f2e',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '460px',
        border: '1px solid #2a2f3e',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
            Shop.vn
          </h1>
          <p style={{ color: '#8b92a7', fontSize: '16px' }}>Đăng ký tài khoản mới</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#ef444420',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#8b92a7', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
              Họ và tên
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập họ và tên"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#0f1419',
                border: '1px solid #2a2f3e',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                transition: 'border 0.2s'
              }}
               onFocus={(e) => e.target.style.borderColor = '#475569'}

              onBlur={(e) => e.target.style.borderColor = '#2a2f3e'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#8b92a7', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Nhập email"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#0f1419',
                border: '1px solid #2a2f3e',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                transition: 'border 0.2s'
              }}
               onFocus={(e) => e.target.style.borderColor = '#475569'}

              onBlur={(e) => e.target.style.borderColor = '#2a2f3e'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#8b92a7', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Nhập số điện thoại"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#0f1419',
                border: '1px solid #2a2f3e',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                transition: 'border 0.2s'
              }}
               onFocus={(e) => e.target.style.borderColor = '#475569'}

              onBlur={(e) => e.target.style.borderColor = '#2a2f3e'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#8b92a7', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#0f1419',
                border: '1px solid #2a2f3e',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                transition: 'border 0.2s'
              }}
               onFocus={(e) => e.target.style.borderColor = '#475569'}

              onBlur={(e) => e.target.style.borderColor = '#2a2f3e'}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: '#8b92a7', fontSize: '14px', marginBottom: '8px', fontWeight: 500 }}>
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#0f1419',
                border: '1px solid #2a2f3e',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                transition: 'border 0.2s'
              }}
               onFocus={(e) => e.target.style.borderColor = '#475569'}

              onBlur={(e) => e.target.style.borderColor = '#2a2f3e'}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginBottom: '20px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#ea580c'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f97316'}
          >
            Đăng ký
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#8b92a7', fontSize: '14px' }}>Đã có tài khoản? </span>
            <button
              type="button"
              onClick={onBackToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#f97316',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
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
