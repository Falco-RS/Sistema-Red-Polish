import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from '../../common/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../common/AuthContext';
import { useTranslation } from 'react-i18next';

const PayProduct = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productosSeleccionados, total } = location.state || { productosSeleccionados: [], total: 0 };
  const { token, user, setIdTrans, setIsCompra } = useAuth();
  const apiUrl = import.meta.env.VITE_IP_API;

  const { t } = useTranslation('global');
  const [metodoPago, setMetodoPago] = useState<'transferencia' | 'sinpe' | null>(null);

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
  }, []);

  const handleConfirmacion = async () => {
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
          descripcion: 'Compra desde el carrito',
          fechaCompra: new Date().toISOString().split('T')[0],
          estadoPago: 'PENDIENTE',
          usuarioEmail: user.email
        };

        const response = await fetch(`${apiUrl}/api/payments/sinpe/pay/compra/${user.email}`, {
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
        const response = await fetch(`${apiUrl}/api/payments/pay/${user.email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            descripcion: 'Compra desde el carrito',
            fechaCompra: new Date().toISOString().split('T')[0],
            estadoPago: 'PENDIENTE',
            usuarioEmail: user.email
          })
        });

        const result = await response.json();
        console.log(result);
        setIdTrans(result.id_compra);
        setIsCompra(true);

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
        <div className="container mt-5">{t('no_products')}</div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <div className="card p-4 shadow-lg">
          <h2 className="text-dark mb-4 text-center">{t('confirm_title')}</h2>

          <h5 className="mb-3">{t('selected_products')}</h5>
          <ul className="list-group mb-3">
            {productosSeleccionados.map((prod: any, index: number) => (
              <li key={index} className="list-group-item d-flex justify-content-between">
                <span>{prod.name} x{prod.quantity}</span>
                <span>₡{(prod.price * prod.quantity).toLocaleString()}</span>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between fw-bold">
              <span>{t('total')}</span>
              <span>₡{total.toLocaleString()}</span>
            </li>
          </ul>

          <hr />

          {/* Pago */}
          <div className="mb-3 mt-4">
            <label className="form-label fw-bold">{t('payment_method')}</label>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="metodoPago" id="transferencia" onChange={() => setMetodoPago('transferencia')} />
              <label className="form-check-label" htmlFor="transferencia">{t('paypal')}</label>
            </div>
            <div className="form-check">
              <input type="radio" className="form-check-input" name="metodoPago" id="sinpe" onChange={() => setMetodoPago('sinpe')} />
              <label className="form-check-label" htmlFor="sinpe">{t('sinpe')}</label>
            </div>
          </div>

          {metodoPago === 'transferencia' && (
            <div className="alert alert-primary">
              {t('paypal_notice')} <strong>PayPal</strong> {t('paypal_notice2')}
            </div>
          )}

          {metodoPago === 'sinpe' && (
            <div className="border p-3 mb-3">
              <h5 className="text-danger">{t('sinpe_title')}</h5>
              <div className="bg-white text-dark p-4 rounded">
                <p className="fw-bold">
                  {t('sinpe_instruction')}
                </p>
                <div className="border border-dark p-3 my-3 text-center fs-5 fw-bold">
                  +506  83582929
                </div>
                <p>
                  {t('sinpe_description')}
                  {t('sinpe_description2')}
                  {t('sinpe_description3')}<strong>{t('sinpe_description4')}</strong> {t('sinpe_description5')}
                  {t('sinpe_description6')}
                </p>
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <button className="btn btn-success" onClick={handleConfirmacion}>
              {t('confirm_button')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayProduct;
