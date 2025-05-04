import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function New_Password() {
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [emailError, setEmailError] = useState<string>('') 
  const navigate = useNavigate()
  const location = useLocation()

  //Nota importante: el correo al usuario para restaurar la contraseña y poder ingresar aca, debe de ser con este formato: http://localhost:5173/new_password?email=usuario@dominio.com
  // Extraer el correo desde la URL (suponiendo que el correo se pasa como un parámetro en la URL)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const emailFromUrl = params.get('email')
    if (emailFromUrl) {
      setEmail(emailFromUrl)
      setEmailError('') // Limpiar error si se encuentra el correo
    } else {
      setEmailError('No se consiguió el correo, por favor intenta ingresar de nuevo.')
    }
  }, [location])

  const validatePassword = (password: string): boolean => {
    // Validación para asegurarse de que la contraseña tenga al menos 8 caracteres
    return password.length >= 8
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Verificar si se encontró el correo antes de proceder
    if (!email) {
      setEmailError('No se consiguió el correo, por favor intenta ingresar de nuevo.')
      return
    }

    // Validación de las contraseñas
    if (!validatePassword(newPassword)) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setError('')
    setSuccessMessage('Contraseña cambiada con éxito.')

    // Aquí, se enviaría el email y la nueva contraseña a la API para realizar el cambio.
    console.log('Correo:', email)
    console.log('Contraseña nueva:', newPassword)

    // Limpiar los campos después de enviar
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{`Cambio de Contraseña - ${email || 'Correo no encontrado'}`}</h2>
      
      {/* Mostrar error si no se consiguió el correo */}
      {emailError && <div className="alert alert-danger">{emailError}</div>}
      
      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
          <input
            type="password"
            className="form-control"
            id="newPassword"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && !emailError && <div className="alert alert-success">{successMessage}</div>}

        <button type="submit" className="btn btn-primary w-100">Cambiar Contraseña</button>
      </form>

      {/* Opción para ir al login */}
      <div className="mt-4 text-center">
        <p className="text-white" style={{ fontSize: '0.9rem' }}>
            ¿Ya cambiaste tu contraseña?{' '}
          <span
            className="text-primary"
            role="button"
            style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
            onClick={() => navigate('/login')}
          >
            Ir al Login
          </span>
        </p>
      </div>
    </div>
  )
}

export default New_Password
