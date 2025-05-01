import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      setError('All fields are required.')
      return
    }

    console.log({ firstName, lastName })

    setError('')
    setFirstName('')
    setLastName('')
    navigate('/')
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75" style={{ zIndex: 1000 }}>
      <div className="bg-white rounded shadow p-4 w-100" style={{ maxWidth: '400px' }}>
        <h2 className="text-center mb-4 text-primary">Bienvenido al Registro de Red Polish</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label fw-black">Escriba su nombre</label>
            <input
              id="firstName"
              type="text"
              className="form-control"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="lastName" className="form-label fw-black">Escriba sus apellidos</label>
            <input
              id="lastName"
              type="text"
              className="form-control"
              placeholder="Apellidos"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 fw-bold">
            Register
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register
