import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  const apiUrl = import.meta.env.VITE_IP_API;


  const [metodoPago, setMetodoPago] = useState<'transferencia' | 'sinpe' | null>(null);

  // Transferencia (tarjeta)
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');

  // SINPE
  const [monto, setMonto] = useState('');
  const [referencia, setReferencia] = useState('');
  const [fechaSinpe, setFechaSinpe] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);


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
      const response = await fetch(`${apiUrl}/api/citas/crear`, {
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
            <label className="form-label fw-bold">Método de pago</label>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name="metodoPago"
                id="transferencia"
                onChange={() => setMetodoPago('transferencia')}
              />
              <label className="form-check-label" htmlFor="transferencia">Transferencia con tarjeta</label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name="metodoPago"
                id="sinpe"
                onChange={() => setMetodoPago('sinpe')}
              />
              <label className="form-check-label" htmlFor="sinpe">SINPE</label>
            </div>
          </div>

          {metodoPago === 'transferencia' && (
            <div className="border p-3 mb-3">
              <h5 className="text-primary">Pago con tarjeta</h5>
              <div className="mb-2">
                <label className="form-label">Número de tarjeta</label>
                <input
                  type="text"
                  className="form-control"
                  maxLength={16}
                  value={numeroTarjeta}
                  onChange={(e) => setNumeroTarjeta(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Nombre del titular</label>
                <input
                  type="text"
                  className="form-control"
                  value={nombreTarjeta}
                  onChange={(e) => setNombreTarjeta(e.target.value)}
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <label className="form-label">Vencimiento</label>
                  <input
                    type="month"
                    className="form-control"
                    value={vencimiento}
                    onChange={(e) => setVencimiento(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    className="form-control"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                </div>
              </div>
              <div className="alert alert-info mt-2">
                Los datos no serán almacenados y serán enviados de forma segura (simulado).
              </div>
            </div>
          )}

          {metodoPago === 'sinpe' && (
            <div className="border p-3 mb-3">
              <h5 className="text-success">Pago por SINPE</h5>
              <div className="mb-2">
                <label className="form-label">Monto</label>
                <input
                  type="number"
                  className="form-control"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Número de referencia</label>
                <input
                  type="text"
                  className="form-control"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Fecha de pago</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaSinpe}
                  onChange={(e) => setFechaSinpe(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Comprobante (archivo PDF o imagen)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="form-control"
                  onChange={(e) => setComprobante(e.target.files?.[0] || null)}
                />
              </div>
              <div className="alert alert-info mt-2">
                Asegúrate de completar todos los campos y subir el comprobante antes de confirmar.
              </div>
            </div>
          )}


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
