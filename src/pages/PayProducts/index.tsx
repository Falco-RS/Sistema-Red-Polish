import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import NavBar from '../../common/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../common/AuthContext';

const PayProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productosSeleccionados, total } = location.state || { productosSeleccionados: [], total: 0 };
  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_IP_API;

  const [metodoNotificacion, setMetodoNotificacion] = useState<'email' | 'sms' | null>(null);
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');

  const [metodoPago, setMetodoPago] = useState<'transferencia' | 'sinpe' | null>(null);
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');

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
      alert('Ingresa un número telefónico válido con prefijo internacional.');
      return;
    }

    if (!token) {
      alert('No se ha encontrado el token de autenticación.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/ordenes/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productosSeleccionados,
          total,
          metodoNotificacion,
          destino: metodoNotificacion === 'sms' ? numeroTelefono : correoUsuario,
        })
      });

      const result = await response.json();

      if (!result.exito) {
        alert(`No se pudo completar la compra: ${result.mensaje}`);
        return;
      }

      alert(`Compra realizada correctamente. Se envió confirmación por ${metodoNotificacion}.`);
      navigate('/catalog');
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert('Ocurrió un error al procesar el pago. Inténtalo más tarde.');
    }
  };

  if (!productosSeleccionados || productosSeleccionados.length === 0) {
    return (
      <>
        <NavBar />
        <div className="container mt-5">No hay productos para procesar.</div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <div className="card p-4 shadow-lg">
          <h2 className="text-danger mb-4 text-center">Confirmación de compra</h2>

          <h5 className="mb-3">Productos seleccionados</h5>
          <ul className="list-group mb-3">
            {productosSeleccionados.map((prod: any, index: number) => (
              <li key={index} className="list-group-item d-flex justify-content-between">
                <span>{prod.name} x{prod.quantity}</span>
                <span>₡{(prod.price * prod.quantity).toLocaleString()}</span>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span>₡{total.toLocaleString()}</span>
            </li>
          </ul>

          <hr />

          {/* Notificación */}
          <div className="mb-3">
            <label className="form-label fw-bold">¿Cómo deseas recibir la confirmación?</label>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="notificacion" id="email" onChange={() => setMetodoNotificacion('email')} />
              <label className="form-check-label" htmlFor="email">Correo electrónico</label>
            </div>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="notificacion" id="sms" onChange={() => setMetodoNotificacion('sms')} />
              <label className="form-check-label" htmlFor="sms">SMS</label>
            </div>
          </div>

          {metodoNotificacion === 'email' && (
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="form-control" value={correoUsuario} onChange={(e) => setCorreoUsuario(e.target.value)} />
            </div>
          )}

          {metodoNotificacion === 'sms' && (
            <div className="mb-3">
              <label className="form-label">Número telefónico con prefijo</label>
              <input type="tel" className="form-control" value={numeroTelefono} onChange={(e) => setNumeroTelefono(e.target.value)} placeholder="+50612345678" />
            </div>
          )}

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
            <>
              <div className="mb-3">
                <label className="form-label">Número de tarjeta</label>
                <input type="text" className="form-control" value={numeroTarjeta} onChange={(e) => setNumeroTarjeta(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Nombre del titular</label>
                <input type="text" className="form-control" value={nombreTarjeta} onChange={(e) => setNombreTarjeta(e.target.value)} />
              </div>
              <div className="mb-3 d-flex gap-3">
                <input type="text" className="form-control" placeholder="MM/AA" value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} />
                <input type="text" className="form-control" placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} />
              </div>
            </>
          )}

          {metodoPago === 'sinpe' && (
            <>
              <div className="mb-3">
                <label className="form-label">Monto</label>
                <input type="text" className="form-control" value={monto} onChange={(e) => setMonto(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Referencia</label>
                <input type="text" className="form-control" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Fecha de la transferencia</label>
                <input type="date" className="form-control" value={fechaSinpe} onChange={(e) => setFechaSinpe(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Comprobante</label>
                <input type="file" className="form-control" onChange={(e) => setComprobante(e.target.files?.[0] || null)} />
              </div>
            </>
          )}

          <div className="text-center mt-4">
            <button className="btn btn-success" onClick={handleConfirmacion}>
              Confirmar compra
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayProduct;
