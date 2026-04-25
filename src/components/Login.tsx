import { useState } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api'
import Register from './Register'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showRegister, setShowRegister] = useState(false)
  const setCurrentUser = useStore((state) => state.setCurrentUser)

  if (showRegister) {
    return <Register onBackToLogin={() => setShowRegister(false)} />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await api.login(email, password)
      setCurrentUser(response.user, response.token)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đăng nhập thất bại!')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f1419',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1f2e',
        padding: '48px',
        borderRadius: '16px',
        border: '1px solid #2a2f3e',
        maxWidth: '450px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 700, 
            color: 'white',
            marginBottom: '8px'
          }}>
            🛍️ Shop.vn
          </h1>
          <p style={{ fontSize: '15px', color: '#8b92a7' }}>Đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              color: '#8b92a7',
              fontWeight: 500
            }}>
              Email
            </label>
            <input 
              type="email" 
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px',
                background: '#0f1419',
                border: '1px solid #2a2f3e',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              color: '#8b92a7',
              fontWeight: 500
            }}>
              Mật khẩu
            </label>
            <input 
              type="password" 
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px',
                background: '#0f1419',
                border: '1px solid #2a2f3e',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
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

          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#ea580c'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f97316'}
          >
            Đăng nhập
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#8b92a7', fontSize: '14px' }}>Chưa có tài khoản? </span>
            <button
              type="button"
              onClick={() => setShowRegister(true)}
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
              Đăng ký ngay
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: '#0f1419',
          borderRadius: '8px',
          border: '1px solid #2a2f3e'
        }}>
          <div style={{ fontSize: '13px', color: '#8b92a7', marginBottom: '12px', fontWeight: 600 }}>
            Tài khoản demo:
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.8' }}>
            <div><strong style={{ color: '#f97316' }}>Admin:</strong> admin@shop.vn / admin123</div>
            <div><strong style={{ color: '#3b82f6' }}>User:</strong> user@shop.vn / user123</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
