import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function New_Password() {
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const navigate = useNavigate()
  const location = useLocation()
  const apiUrl = import.meta.env.VITE_IP_API;

  useEffect(() => {
    const emailFromState = location.state?.email
    if (emailFromState) {
      setEmail(emailFromState)
    } else {
      setError('No se consiguió el correo, por favor intenta ingresar de nuevo.')
    }
  }, [location])

  const validatePassword = (password: string): boolean => {
    return password.length >= 8
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email) {
      setError('No se consiguió el correo, por favor intenta ingresar de nuevo.')
      return
    }

    if (!validatePassword(newPassword)) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    try {
      const loginData = {
        password: newPassword,
        repeatPassword: confirmPassword
      }

      const response = await fetch(`${apiUrl}/api/forgotPassword/changePassword/${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const text = await response.text()
      
      if (text !== 'Clave actualizada correctamente!') {
        throw new Error('Algo ocurrió mal, no se pudo actualizar la contraseña')
      } else {
        navigate('/login')
      }

      setSuccessMessage('Contraseña cambiada con éxito.')
      setError('')
      setNewPassword('')
      setConfirmPassword('')

      // Redirigir al login después de unos segundos (opcional)
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Ocurrió un error inesperado.')
    }
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{`Cambio de Contraseña - ${email || 'Correo no encontrado'}`}</h2>

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
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <button type="submit" className="btn btn-primary w-100">Cambiar Contraseña</button>
      </form>

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
