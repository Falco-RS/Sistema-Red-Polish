import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { Eye, EyeOff } from 'lucide-react'

const UserManagement = () => {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('Juan')
  const [lastName, setLastName] = useState('Pérez')
  const [email, setEmail] = useState('juanperez@gmail.com')
  const [role, setRole] = useState('cliente')
  const [password, setPassword] = useState('12345678')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Por favor, complete todos los campos obligatorios.')
      setSuccess(false)
      return
    }

    const updatedUser = {
      nombre: `${firstName}`,
      apellido: `${lastName}`,
      email: email,
      password: password,
    }

    console.log('Datos enviados:', JSON.stringify(updatedUser, null, 2))

    setError('')
    setSuccess(true)
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/') 
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, navigate])

  return (
    <>
      <NavBar />
      <div className="container py-5" style={{ maxWidth: '600px' }}>
        <div className="bg-light p-5 rounded-4 shadow" style={{ border: '2px solid #dc3545' }}>
          <h2 className="text-center text-danger fw-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Gestión de Usuario
          </h2>

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success text-center fw-semibold" role="alert">
              ✅ ¡Tus datos han sido actualizados! Redirigiendo al inicio.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control border-dark-subtle"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Apellidos</label>
              <input
                type="text"
                className="form-control border-dark-subtle"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control border-dark-subtle"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Contraseña actual</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-dark-subtle"
                  value={password}
                  readOnly
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="form-text">Presiona el ojo para ver tu contraseña actual.</div>
            </div>
            <div className="mb-4">
              <label className="form-label">Cambiar contraseña (opcional)</label>
              <input
                type="password"
                className="form-control border-dark-subtle"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
              />
            </div>
            <button type="submit" className="btn btn-danger w-100 fw-bold">
              Guardar Cambios
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default UserManagement
