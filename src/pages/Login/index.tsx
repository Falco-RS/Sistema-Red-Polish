import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../common/AuthContext'
import PopUpWindow from '../Pop-up_Window';

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth();
  const apiUrl = import.meta.env.VITE_IP_API;

  const [modalInfo, setModalInfo] = useState<{ show: boolean; title: string; content: string; onConfirm?: () => void }>({
    show: false,
    title: '',
    content: '',
  });

  const showAlert = (title: string, content: string, onConfirm?: () => void) => {
    setModalInfo({ show: true, title, content, onConfirm });
  };


  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showAlert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    const loginData = { email, password };

    try {
      const response = await fetch(`${apiUrl}/api/users/sign_in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showAlert('Error', errorData.message || 'Error al iniciar sesión.');
        return;
      }

      const data = await response.json();
      login(data.user, data.token);
      navigate('/');
      setEmail('');
      setPassword('');
    } catch (err) {
      showAlert('Error', 'Contraseña o usuario incorrecto.');
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
      <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '450px', boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.1)' }}>
        <h2 className="text-center mb-4 text-primary fw-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="form-label fw-medium" style={{ fontSize: '1.1rem', color: '#555' }}>Correo electrónico</label>
            <input
              id="email"
              type="email"
              className="form-control border-0 shadow-sm"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ borderRadius: '20px', padding: '12px 16px', fontSize: '1rem', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s' }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-medium" style={{ fontSize: '1.1rem', color: '#555' }}>Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-control border-0 shadow-sm"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ borderRadius: '20px', padding: '12px 16px', fontSize: '1rem', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s' }}
            />
          </div>

          <button type="submit" className="btn btn-gradient w-100 py-3 fw-bold" style={{
            background: 'linear-gradient(to right, #007bff 0%, #3399ff 100%)',
            borderRadius: '50px',
            color: '#fff',
            fontSize: '1.1rem',
            transition: 'transform 0.2s ease-in-out',
            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
            border: 'none'
          }}>
            Ingresar
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-dark" style={{ fontSize: '0.9rem' }}>
            ¿No tienes una cuenta aún?{' '}
            <span
              className="text-primary"
              role="button"
              style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
              onClick={() => navigate('/register')}
            >
              Regístrate aquí
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
          <p className="text-dark" style={{ fontSize: '0.9rem' }}>
            ¿Olvidaste tu contraseña?{' '}
            <span
              className="text-primary"
              role="button"
              style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}
              onClick={() => navigate('/recover')}
            >
              Recupera tu contraseña aquí
            </span>
          </p>
        </div>
      </div>
      {modalInfo.show && (
        <PopUpWindow
          show={modalInfo.show}
          title={modalInfo.title}
          onClose={() => setModalInfo({ ...modalInfo, show: false })}
          onConfirm={() => {
            setModalInfo({ ...modalInfo, show: false });
            if (modalInfo.onConfirm) modalInfo.onConfirm();
          }}
        >
          <p>{modalInfo.content}</p>
        </PopUpWindow>
      )}
    </div>
  )
}

export default Login
