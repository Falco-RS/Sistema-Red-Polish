import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from '../../common/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../common/AuthContext'

const PayService = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { servicio, fechaSeleccionada } = location.state || {};

  const [metodoNotificacion, setMetodoNotificacion] = useState<'email' | 'sms' | null>(null);
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState(''); 
  const { token } = useAuth();

  const handleConfirmacion = async () => {
    if (!metodoNotificacion) {
      alert('Selecciona un método de notificación.');
      return;
    }

    if (metodoNotificacion === 'sms' && !numeroTelefono.startsWith('+')) {
      alert('Ingresa un número telefónico válido con prefijo internacional (ej: +50612345678).');
      return;
    }
    console.log(token);

    if (!token) {
      alert('No se ha encontrado el token de autenticación.'+ token);
      return;
    }

    const fecha = fechaSeleccionada.toISOString().split('T')[0]; 
    const hora = fechaSeleccionada.toTimeString().slice(0, 5);   

    const body = {
      servicioId: servicio.id, 
      descripcion: servicio.descripcion,
      fecha,
      hora,
      metodoNotificacion,
      destino: metodoNotificacion === 'sms' ? numeroTelefono : correoUsuario
    };

    try {
      const response = await fetch('http://localhost:8080/api/citas/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!result.exito) {
        alert(`No se pudo agendar la cita: ${result.mensaje}`);
        return;
      }

      alert(`Cita confirmada. Se ha enviado la confirmación por ${metodoNotificacion}. ¡Gracias!`);
      navigate('/services');
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      alert('Ocurrió un error al enviar la solicitud. Inténtalo más tarde.');
    }
  };

  if (!servicio || !fechaSeleccionada) {
    return (
      <>
        <NavBar />
        <div className="container mt-5">No hay datos suficientes para continuar.</div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <div className="card p-4 shadow-lg">
          <h2 className="text-danger mb-4 text-center">Confirmación de cita</h2>

          <p><strong>Servicio:</strong> {servicio.nombre}</p>
          <p><strong>Descripción:</strong> {servicio.descripcion}</p>
          <p><strong>Fecha:</strong> {fechaSeleccionada.toLocaleDateString()}</p>
          <p><strong>Hora:</strong> {fechaSeleccionada.toLocaleTimeString()}</p>

          <hr />

          <div className="mb-3">
            <label className="form-label fw-bold">¿Cómo deseas recibir la confirmación de la cita?</label>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name="notificacion"
                id="email"
                value="email"
                onChange={() => setMetodoNotificacion('email')}
              />
              <label className="form-check-label" htmlFor="email">Correo electrónico</label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name="notificacion"
                id="sms"
                value="sms"
                onChange={() => setMetodoNotificacion('sms')}
              />
              <label className="form-check-label" htmlFor="sms">SMS</label>
            </div>
          </div>

          {metodoNotificacion === 'email' && (
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                value={correoUsuario}
                onChange={(e) => setCorreoUsuario(e.target.value)}
                placeholder="ejemplo@correo.com"
              />
            </div>
          )}

          {metodoNotificacion === 'sms' && (
            <div className="mb-3">
            <label className="form-label">Número telefónico con prefijo</label>
            <div className="input-group">
            <select
                className="form-select"
                style={{ maxWidth: '120px' }}
                onChange={(e) => {
                const numero = numeroTelefono.replace(/^\+\d+/, ''); // quitar prefijo actual
                setNumeroTelefono(`${e.target.value}${numero}`);
                }}
            >
                <option value="+506">+506 (CR)</option>
                <option value="+52">+52 (MX)</option>
                <option value="+1">+1 (US)</option>
                <option value="+34">+34 (ES)</option>
                <option value="+57">+57 (CO)</option>
            </select>
            <input
                type="tel"
                className="form-control"
                value={numeroTelefono}
                onChange={(e) => setNumeroTelefono(e.target.value)}
                placeholder="+50612345678"
            />
            </div>
        </div>
        )}


          <hr />

          <div className="mb-3">
            <h5 className="text-muted">[Espacio reservado para el pago]</h5>
            <div className="alert alert-secondary">La funcionalidad de pago será integrada más adelante.</div>
          </div>

          <div className="text-center">
            <button className="btn btn-danger" onClick={handleConfirmacion}>
              Confirmar cita
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayService;
