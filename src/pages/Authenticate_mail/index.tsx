import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function Authenticate_mail() {
  const [otp, setOtp] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [resendTimer, setResendTimer] = useState<number>(120)
  const [isResending, setIsResending] = useState<boolean>(false)
  const navigate = useNavigate()
  const location = useLocation()
  const apiUrl = import.meta.env.VITE_IP_API;


  const email = location.state?.email

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'

    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

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

  const handleResendCode = async () => {
    if (!email) return

    setIsResending(true)

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
        setResendTimer(120)
        throw new Error('Algo ocurrió mal, no se pudo reenviar el codigo')
      } else {
        setError('') 
        setResendTimer(120)
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al reenviar el código.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-dark">Verificar Código</h2>
      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
        <div className="mb-3">
          <label htmlFor="otp" className="form-label text-dark">Código de verificación</label>
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

        <button type="submit" className="btn btn-success w-100 mb-2">Verificar</button>

        <button
          type="button"
          className="btn btn-secondary w-100"
          onClick={handleResendCode}
          disabled={resendTimer > 0 || isResending}
        >
          {resendTimer > 0
            ? `Reenviar código (${resendTimer}s)`
            : 'Reenviar código'}
        </button>
      </form>
    </div>
  )
}

export default Authenticate_mail
