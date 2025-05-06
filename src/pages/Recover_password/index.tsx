import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Recover_Password() {
  const [email, setEmail] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [showModal, setShowModal] = useState<boolean>(false)
  const navigate = useNavigate()

  const validateEmail = (email: string): boolean => {
    return email.includes('@') && email.endsWith('.com')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setError('Por favor ingresa un correo válido que contenga "@" y termine en ".com"')
      return
    }

    setError('')
    setShowModal(true)

    // Aquí puedes guardar el correo para usarlo después:
    const correoRecuperacion = email
    console.log('Correo ingresado:', correoRecuperacion)

    // En el futuro aquí iría el código para enviar el correo
    //Nota importante: el correo al usuario para restaurar la contraseña y poder ingresar aca, debe de ser con este formato: http://localhost:5173/new_password?email=usuario@dominio.com

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
      </form>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          tabIndex={0}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Correo Enviado</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Se enviará un codigo a tu correo para verificarlo.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opción para volver al login */}
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
