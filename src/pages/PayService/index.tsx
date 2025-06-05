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
  const { user ,token } = useAuth();
  const apiUrl = import.meta.env.VITE_IP_API;


  const [metodoPago, setMetodoPago] = useState<'transferencia' | 'sinpe' | null>(null);


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
      date: fecha,
      hour: hora,
      state: 'PENDIENTE',
      userId: user.id,
      serviceId: servicio.id,
    };

    console.log(JSON.stringify(body))
    try {
      const response = await fetch(`${apiUrl}/api/payments/pay/appointment/${user.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body)
      });
      const result = await response.json();

      console.log("Redirigiendo a:", result.sessionUrl);
      console.log("Tipo:", typeof result.sessionUrl);
      console.log("Contiene https?:", result.sessionUrl.includes("https://"));

      if (typeof result.sessionUrl === 'string' && result.sessionUrl.startsWith("https://")) {
        window.location.href = result.sessionUrl;
      } else {
        alert("URL inválida para redirección");
      }

      /*

      if (!result.exito) {
        alert(`No se pudo agendar la cita: ${result.mensaje}`);
        return;
      }*/



      alert(`Cita confirmada. Se ha enviado la confirmación por ${metodoNotificacion}. ¡Gracias!`);

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
          <h2 className="text-dark mb-4 text-center">Confirmación de cita</h2>

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
          {/* Pago */}
          <div className="mb-3 mt-4">
            <label className="form-label fw-bold">Método de pago</label>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="metodoPago" id="transferencia" onChange={() => setMetodoPago('transferencia')} />
              <label className="form-check-label" htmlFor="transferencia">Transferencia con tarjeta</label>
            </div>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="metodoPago" id="sinpe" onChange={() => setMetodoPago('sinpe')} />
              <label className="form-check-label" htmlFor="sinpe">SINPE Móvil</label>
            </div>
          </div>

          {metodoPago === 'transferencia' && (
            <div className="alert alert-primary">
              Al confirmar tu cita, serás redirigido automáticamente a <strong>PayPal</strong> para realizar el pago de forma segura.
            </div>
          )}

          {metodoPago === 'sinpe' && (
             <div className="border p-3 mb-3">
              <h5 className="text-primary">Pago por SINPE</h5>
              
              <div className="bg-white text-dark p-4 rounded">
                <p className="fw-bold">
                  Para finalizar la compra debes mandarle un mensaje a nuestro administrador Cristian Rojas al siguiente número:
                </p>

                <div className="border border-dark p-3 my-3 text-center fs-5 fw-bold">
                  +506  83582929
                </div>

                <p>
                  Con él podrás hacer el pago por un SINPE. Tienes 2 días para realizarlo después de seleccón finalizar compra, por ese tiempo tendrás tu cita apartada.
                  Antes de acabar los dos días, Cristian podrá actualizar el estado de tu pago a exitoso o cancelado.
                  Podrás ver este estado en el apartado de <strong>“Mis Citas”</strong> en tu usuario.
                  ¡Gracias por preferirnos!
                </p>
              </div>
            </div>
          )}
          <div className="text-center">
            <button className="btn btn-primary" onClick={handleConfirmacion}>
              Confirmar cita
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayService;
