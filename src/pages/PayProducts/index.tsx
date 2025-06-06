import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import NavBar from '../../common/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../common/AuthContext';

const PayProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productosSeleccionados, total } = location.state || { productosSeleccionados: [], total: 0 };
  const { token, user } = useAuth();
  const apiUrl = import.meta.env.VITE_IP_API;

  const [metodoNotificacion, setMetodoNotificacion] = useState<'email' | 'sms' | null>(null);
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [metodoPago, setMetodoPago] = useState<'transferencia' | 'sinpe' | null>(null);

  const handleConfirmacion = async () => {
    if (!metodoNotificacion) {
      alert('Selecciona un método de notificación.');
      return;
    }

    if (metodoNotificacion === 'sms' && !numeroTelefono.startsWith('+')) {
      alert('Ingresa un número telefónico válido con prefijo internacional.');
      return;
    }

    if (!token || !user?.email) {
      alert('No se ha encontrado el token de autenticación o el correo del usuario.');
      return;
    }

    if (!metodoPago) {
      alert('Selecciona un método de pago.');
      return;
    }

    try {
      if (metodoPago === 'sinpe') {
        const bodySinpe = {
          productos: productosSeleccionados,
          total,
        };

        const response = await fetch(`${apiUrl}/api/payments/sinpe/pay/producto/${user.email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(bodySinpe),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'No se pudo registrar el pago por SINPE.');
        }

        alert('Tu compra ha sido registrada exitosamente. Tienes 2 días para realizar el pago por SINPE.');
        navigate('/catalog');
        return;
      }

      if (metodoPago === 'transferencia') {
        const response = await fetch(`${apiUrl}/apy/payments/pay/${user.email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            descripcion: 'Compra desde el carrito',
            fechaCompra: new Date().toISOString().split('T')[0],
            estadoPago: 'Pendiente',
            usuarioEmail: user.email
          })
        });

        const result = await response.json();

        if (typeof result.sessionUrl === 'string' && result.sessionUrl.startsWith("https://")) {
          window.location.href = result.sessionUrl;
        } else {
          alert("URL inválida para redirección a PayPal.");
        }

        return;
      }
    } catch (error) {
      console.error('Error al procesar la compra:', error);
      alert('Ocurrió un error al procesar la compra. Inténtalo más tarde.');
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
              <label className="form-check-label" htmlFor="transferencia">Transferencia con tarjeta (PayPal)</label>
            </div>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="metodoPago" id="sinpe" onChange={() => setMetodoPago('sinpe')} />
              <label className="form-check-label" htmlFor="sinpe">SINPE Móvil</label>
            </div>
          </div>

          {metodoPago === 'transferencia' && (
            <div className="alert alert-danger">
              Al confirmar tu compra, serás redirigido automáticamente a <strong>PayPal</strong> para realizar el pago de forma segura.
            </div>
          )}

          {metodoPago === 'sinpe' && (
            <div className="border p-3 mb-3">
              <h5 className="text-danger">Pago por SINPE</h5>
              <div className="bg-white text-dark p-4 rounded">
                <p className="fw-bold">
                  Para finalizar la compra debes mandarle un mensaje a nuestro administrador Cristian Rojas al siguiente número:
                </p>
                <div className="border border-dark p-3 my-3 text-center fs-5 fw-bold">
                  +506 12345678
                </div>
                <p>
                  Con él podrás hacer el pago por un SINPE. Tienes 2 días para realizarlo después de seleccionar “Finalizar compra”, por ese tiempo tendrás tu pedido reservado.
                  Antes de acabar los dos días, Cristian podrá actualizar el estado de tu pago a exitoso o cancelado.
                  Podrás ver este estado en el apartado de <strong>“Mis Compras”</strong> en tu usuario.
                  ¡Gracias por preferirnos!
                </p>
              </div>
            </div>
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
