import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Recover_Password() {
  const [email, setEmail] = useState<string>('')
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API;

  const validateEmail = (email: string): boolean => {
    return email.includes('@') && email.endsWith('.com')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setError('Por favor ingresa un correo válido que contenga "@" y termine en ".com"')
      return
    }

    setError('') // limpiar errores previos

    try {
      const loginData = { email }

      const response = await fetch(`${apiUrl}/api/forgotPassword/verifyMail/${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const text = await response.text()
      if (text !== 'Se ha enviado el email de verifycacion') {
        throw new Error('Algo ocurrió mal, no se pudo enviar el email')
      } else {
        navigate('/authenticate_mail', { state: { email } })
      }      

    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'Ocurrió un error inesperado.')
    }
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Recuperar Contraseña</h2>
      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary w-100">Enviar</button>
        <p className="text-white text-center mt-2" style={{ fontSize: '0.9rem' }}>
          Cuando el código se envíe, tendrás 2 minutos antes de que expire.
        </p>
      </form>

      <div className="mt-4 text-center">
        <p className="text-white" style={{ fontSize: '0.9rem' }}>
          ¿Ya recuerdas tu contraseña?{' '}
          <span
            className="text-primary"
            role="button"
            style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
            onClick={() => navigate('/login')}
          >
            Volver al Login
          </span>
        </p>
      </div>
    </div>
  )
}

export default Recover_Password
