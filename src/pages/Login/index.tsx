import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('Todos los campos son obligatorios.')
      return
    }

    console.log({ email, password })

    // Aquí podrías hacer la verificación real del login
    setError('')
    setEmail('')
    setPassword('')
    navigate('/') // redirige al home
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
      <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '400px', boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.1)' }}>
        <h2 className="text-center mb-4 text-primary fw-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="form-label fw-medium" style={{ fontSize: '1.1rem', color: '#555' }}>Correo electrónico</label>
            <input
              id="email"
              type="email"
              className="form-control border-0 shadow-sm"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ borderRadius: '20px', padding: '12px 16px', fontSize: '1rem', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s' }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-medium" style={{ fontSize: '1.1rem', color: '#555' }}>Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-control border-0 shadow-sm"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ borderRadius: '20px', padding: '12px 16px', fontSize: '1rem', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s' }}
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 mb-4">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-gradient w-100 py-3 fw-bold" style={{
            background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', 
            borderRadius: '50px', 
            color: '#fff', 
            fontSize: '1.1rem', 
            transition: 'transform 0.2s ease-in-out', 
            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
          }}>
            Ingresar
          </button>
        </form>

        {/* Enlaces debajo del formulario */}
        <div className="mt-4 text-center">
          <p className="text-dark" style={{ fontSize: '0.9rem' }}>
            ¿No tienes una cuenta aún?{' '}
            <span
              className="text-primary"
              role="button"
              style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
              onClick={() => navigate('/register')}
            >
              Regístrate aquí
            </span>
          </p>
          <p className="text-dark" style={{ fontSize: '0.9rem' }}>
            ¿Deseas volver al home?{' '}
            <span
              className="text-primary"
              role="button"
              style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
              onClick={() => navigate('/')}
            >
              Ir al inicio
            </span>
          </p>
          
          {/* Opción para recuperar contraseña */}
          <p className="text-dark" style={{ fontSize: '0.9rem' }}>
            ¿Olvidaste tu contraseña?{' '}
            <span
              className="text-primary"
              role="button"
              style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
              onClick={() => navigate('/recover')}
            >
              Recupera tu contraseña aquí
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
