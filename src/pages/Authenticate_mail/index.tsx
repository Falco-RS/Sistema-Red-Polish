import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function Authenticate_mail() {
  const [otp, setOtp] = useState<string>('')
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()
  const location = useLocation()
  const apiUrl = import.meta.env.VITE_IP_API;

  // Extraer el correo desde el state (enviado desde Recover_Password)
  const email = location.state?.email

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!otp || !email) {
      setError('Por favor ingresa el código y asegúrate de tener el correo válido.')
      return
    }

    try {
      const response = await fetch(`${apiUrl}/api/forgotPassword/verifyOtp/${otp}/${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const text = await response.text()
      console.log('Respuesta de la API:', text)
      
      if (text !== 'Clave dinamica verificada') {
        throw new Error('Código inválido o no verificado correctamente.')
      } else {
        navigate('/new_password', { state: { email } })
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Ocurrió un error al verificar el código.')
    }
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Verificar Código</h2>
      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
        <div className="mb-3">
          <label htmlFor="otp" className="form-label">Código de verificación</label>
          <input
            type="text"
            className="form-control"
            id="otp"
            value={otp}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-success w-100">Verificar</button>
      </form>
    </div>
  )
}

export default Authenticate_mail
