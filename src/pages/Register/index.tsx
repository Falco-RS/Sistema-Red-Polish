import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {useAuth} from "../../common/AuthContext.tsx";
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('')
  const apiUrl = import.meta.env.VITE_IP_API;
  const { login } = useAuth();

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Todos los campos son obligatorios.')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const userData = {
      name: firstName,
      last_name: lastName,
      email: email,
      password: password
    }

    console.log('Datos listos para enviar al backend:', JSON.stringify(userData, null, 2))

    try {
      const response = await fetch(`${apiUrl}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Error al registrar el usuario.')
        return
      }

      setError('')

      const loginData = {
        email,
        password,
      };

      const responselog = await fetch(`${apiUrl}/api/users/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!responselog.ok) {
        const errorData = await responselog.json();
        setError(errorData.message || 'Error al iniciar sesion.')
        return;
      }

      const data = await responselog.json();
      console.log('Usuario autenticado:', data);

      login(data.user, data.token);

      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err) {
      setError('Error de conexión con el servidor.')
    }
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
      <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '450px', boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.1)', overflowY: 'auto', maxHeight: '90vh' }}>
        <h2 className="text-center mb-4 text-primary fw-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Bienvenido al Registro de Red Polish
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstName" className="form-label fw-medium" style={{ fontSize: '1.1rem', color: '#555' }}>
              Escriba su nombre
            </label>
            <input
              id="firstName"
              type="text"
              className="form-control border-0 shadow-sm"
              placeholder="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{
                borderRadius: '20px',
                padding: '12px 16px',
                fontSize: '1rem',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s',
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="lastName" className="form-label fw-medium" style={{ fontSize: '1.1rem', color: '#555' }}>
              Escriba sus apellidos
            </label>
            <input
              id="lastName"
              type="text"
              className="form-control border-0 shadow-sm"
              placeholder="Apellidos"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{
                borderRadius: '20px',
                padding: '12px 16px',
                fontSize: '1rem',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s',
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="form-label fw-medium" style={{ fontSize: '1.1rem', color: '#555' }}>
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="form-control border-0 shadow-sm"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                borderRadius: '20px',
                padding: '12px 16px',
                fontSize: '1rem',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s',
              }}
            />
          </div>

                    <div className="mb-4">
            <label htmlFor="password" className="form-label fw-medium" style={{ fontSize: '1.1rem', color: '#555' }}>
              Contraseña(Mínimo 8 caracteres)
            </label>
            <div className="position-relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control border-0 shadow-sm"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  borderRadius: '20px',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s',
                }}
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                role="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} color="black" /> : <Eye size={20} color="black" />}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label fw-medium" style={{ fontSize: '1.1rem', color: '#555' }}>
              Confirmar Contraseña
            </label>
            <div className="position-relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control border-0 shadow-sm"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  borderRadius: '20px',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s',
                }}
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                role="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} color="black" /> : <Eye size={20} color="black" />}
              </span>
            </div>
          </div>
          {error && (
            <div className="alert alert-primary py-2 mb-4">
              {error}
            </div>
          )}
              <button
                type="submit"
                className="btn w-100 py-3 fw-bold"
                style={{
                  background: 'linear-gradient(to right, #007bff 0%, #3399ff 100%)',
                  borderRadius: '50px',
                  color: '#fff',
                  fontSize: '1.1rem',
                  transition: 'transform 0.2s ease-in-out',
                  boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
                  border: 'none'
                }}
              >
                Registrar
              </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-dark" style={{ fontSize: '0.9rem' }}>
            ¿Ya tienes una cuenta?{' '}
            <span
              className="text-primary"
              role="button"
              style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
              onClick={() => navigate('/login')}
            >
              Inicia sesión aquí
            </span>
          </p>
          <p className="text-dark" style={{ fontSize: '0.9rem' }}>
            ¿Deseas volver al home?{' '}
            <span
              className="text-primary"
              role="button"
              style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
              onClick={() => navigate('/')}
            >
              Ir al inicio
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
