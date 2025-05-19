import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'

const UserManagement = () => {
  const navigate = useNavigate()
  const { user, token, login } = useAuth()
  const apiUrl = import.meta.env.VITE_IP_API;

  const [firstName, setFirstName] = useState(user?.user?.name || '')
  const [lastName, setLastName] = useState(user?.user?.last_name || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState<'info' | 'citas' | 'gestion'>('info')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const userEmail = user?.user?.email

    if (!firstName.trim() || !lastName.trim()) {
      setError('Por favor, complete los campos que desea cambiar en su perfil')
      setSuccess(false)
      return
    }

    const updatedUser = {
      name: firstName,
      last_name: lastName,
      password: password || user?.user?.password,
    }

    const fullUser = {
      id: user?.user?.id,
      name: firstName,
      last_name: lastName,
      email: userEmail,
      password: password || user?.user?.password,
      rol: user?.user?.rol,
    }

    try {
      const response = await fetch(`${apiUrl}/api/users/update/${userEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Error al actualizar los datos.')
        setSuccess(false)
        return
      }
      login(fullUser, token!)



      setError('')
      setSuccess(true)
    } catch (err) {
      console.error('❌ Error al hacer la petición:', err)
      setError('Error de conexión con el servidor.')
      setSuccess(false)
    }
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
      <div className="container-fluid d-flex" style={{ minHeight: '100vh' }}>
        <div className="bg-danger text-white p-4" style={{ width: '250px', minHeight: '100%' }}>
          <h4 className="fw-bold mb-4">Mi perfil</h4>
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <button className={`btn btn-sm w-100 text-start ${activeSection === 'info' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
                onClick={() => setActiveSection('info')}>Información</button>
            </li>
            <li className="nav-item mb-2">
              <button className={`btn btn-sm w-100 text-start ${activeSection === 'citas' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
                onClick={() => setActiveSection('citas')}>Mis citas</button>
            </li>
            <li className="nav-item">
              <button className={`btn btn-sm w-100 text-start ${activeSection === 'gestion' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
                onClick={() => setActiveSection('gestion')}>Gestión de usuario</button>
            </li>
          </ul>
        </div>

        <div className="flex-grow-1 p-5">
          {activeSection === 'info' && (
            <>
              <h2 className="text-danger fw-bold mb-4">Información del Usuario</h2>
              <div className="mb-3">
                <strong>Nombre:</strong> {user?.user?.name}
              </div>
              <div className="mb-3">
                <strong>Apellidos:</strong> {user?.user?.last_name}
              </div>
              <div className="mb-3">
                <strong>Correo:</strong> {user?.user?.email}
              </div>
            </>
          )}

          {activeSection === 'citas' && (
            <div>
              <h2 className="text-danger fw-bold mb-4">Mis Citas</h2>
              <p>(Apartado en Construccion)</p>
            </div>
          )}

          {activeSection === 'gestion' && (
            <div className="bg-light p-4 rounded-4 shadow" style={{ border: '2px solid #dc3545', maxWidth: '600px' }}>
              <h2 className="text-danger fw-bold mb-4">Gestión de Usuario</h2>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">✅ ¡Datos actualizados! Redirigiendo al inicio...</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-dark fw-semibold">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-dark fw-semibold">Apellidos</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-dark fw-semibold">Nueva contraseña (opcional)</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Cree una nueva contraseña"
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
                </div>

                <button type="submit" className="btn btn-danger w-100 fw-bold">
                  Guardar Cambios
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default UserManagement

