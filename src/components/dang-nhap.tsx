import { useState } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../api'
import Register from './dang-ky'
import '../styles/dang-nhap.css'

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
    <div className="dang-nhap-page">
      <div className="dang-nhap-page__card">
        <div className="dang-nhap-page__header">
          <h1 className="dang-nhap-page__title">
            🛍️ Shop.vn
          </h1>
          <p className="dang-nhap-page__subtitle">Đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="dang-nhap-page__group">
            <label className="dang-nhap-page__label">
              Email
            </label>
            <input
              className="dang-nhap-page__input"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="dang-nhap-page__group">
            <label className="dang-nhap-page__label">
              Mật khẩu
            </label>
            <input
              className="dang-nhap-page__input"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="dang-nhap-page__error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="dang-nhap-page__submit"
            onMouseEnter={(e) => e.currentTarget.style.background = '#ea580c'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f97316'}
          >
            Đăng nhập
          </button>

          <div className="dang-nhap-page__footer">
            <span className="dang-nhap-page__footer-text">Chưa có tài khoản? </span>
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="dang-nhap-page__link"
            >
              Đăng ký ngay
            </button>
          </div>
        </form>

        <div className="dang-nhap-page__demo">
          <div className="dang-nhap-page__demo-title">
            Tài khoản demo:
          </div>
          <div className="dang-nhap-page__demo-list">
            <div><strong className="dang-nhap-page__demo-admin">Admin:</strong> admin@shop.vn / admin123</div>
            <div><strong className="dang-nhap-page__demo-user">User:</strong> user@shop.vn / user123</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
