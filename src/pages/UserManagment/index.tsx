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

  const apiUrl = import.meta.env.VITE_IP_API;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    const userEmail = user?.user?.email
    const userToken = user?.token
  
    if (!firstName.trim() || !lastName.trim() || password.trim())  {
      setError('Por favor, complete los campos que desea cambiar en su perfil')
      setSuccess(false)
      return
    }
  
    const updatedUser = {
      name: firstName || user?.user?.name,
      last_name: lastName || user?.user?.last_name,
      password: password || user?.user?.password
    }

    const updateddUser = {
      id: user?.user?.id,
      name: firstName || user?.user?.name,
      last_name: lastName || user?.user?.last_name,
      email: userEmail,
      password: password || user?.user?.password, 
      rol: user?.user?.rol,
    }
  
    console.log('📦 Datos listos para enviar al backend:', updatedUser)

    try {
      const response = await fetch(`${apiUrl}/api/users/update/${userEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          updatedUser
        }),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Error al actualizar los datos.')
        setSuccess(false)
        return
      }
  
      login({
        token: userToken,
        user: updateddUser,
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

