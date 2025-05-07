import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'

const UserManagement = () => {
  const navigate = useNavigate()
  const { user, login } = useAuth()

  const [firstName, setFirstName] = useState(user?.name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    const userEmail = user?.user?.email
    const userToken = user?.token
  
    // Debug
    console.log('🔎 Usuario completo desde AuthContext:', user)
    console.log('📧 Email del usuario:', userEmail)
    console.log('🔐 Token del usuario:', userToken)
  
    if (!firstName.trim() || !lastName.trim() || !userEmail) {
      setError('Por favor, complete todos los campos obligatorios.')
      setSuccess(false)
      return
    }
  
    const updatedUser = {
      name: firstName,
      last_name: lastName,
      password: password || user?.user?.password
    }
  
    console.log('📦 Datos listos para enviar al backend:', updatedUser)



    try {
      const response = await fetch(`http://localhost:8080/api/users/update/cristopheralberto07@gmail.com`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: firstName,
          last_name: lastName,
          password: password
        }),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Error al actualizar los datos.')
        setSuccess(false)
        return
      }
  
      // 🔄 Actualizamos el usuario en el AuthContext
      login({
        token: userToken,
        user: updatedUser,
      })
  
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
              <label className="form-label text-dark fw-semibold">Nombre</label>
              <input
                type="text"
                className="form-control bg-white text-dark border-dark-subtle"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-dark fw-semibold">Apellidos</label>
              <input
                type="text"
                className="form-control bg-white text-dark border-dark-subtle"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-dark fw-semibold">Correo electrónico</label>
              <input
                type="email"
                className="form-control border-dark-subtle"
                value={user?.email || ''}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-dark fw-semibold">Nueva contraseña (opcional)</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control border-dark-subtle"
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
      </div>
    </>
  )
}

export default UserManagement
