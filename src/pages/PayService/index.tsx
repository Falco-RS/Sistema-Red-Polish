import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from '../../common/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../common/AuthContext'
import { useTranslation } from 'react-i18next';

const PayService = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { servicio, fechaSeleccionada } = location.state || {};
  const { user ,token, setIdTrans } = useAuth();
  const apiUrl = import.meta.env.VITE_IP_API;
  const { t } = useTranslation('global');
  

  const [metodoPago, setMetodoPago] = useState<'transferencia' | 'sinpe' | null>(null);


  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'
  }, [])


  const handleConfirmacion = async () => {
    if (!token) {
      alert('No se ha encontrado el token de autenticación.');
      return;
    }

    if (!metodoPago) {
      alert('Selecciona un método de pago.');
      return;
    }

    const fecha = fechaSeleccionada.toISOString().split('T')[0];
    const hora = fechaSeleccionada.toTimeString().slice(0, 5);

    try {
      if (metodoPago === 'sinpe') {
        const bodySinpe = {
          date: fecha,
          hour: hora,
          serviceId: servicio.id,
        };

        const response = await fetch(`${apiUrl}/api/payments/sinpe/pay/cita/${user.email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bodySinpe)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'No se pudo registrar la cita por SINPE');
        }

        alert('Tu cita ha sido registrada exitosamente. Tienes 2 días para realizar el pago por SINPE.');
        navigate('/services');
        return;
      }

      if (metodoPago === 'transferencia') {
        const bodyTransferencia = {
          date: fecha,
          hour: hora,
          state: 'PENDIENTE',
          userId: user.id,
          serviceId: servicio.id,
        };
        console.log(`${apiUrl}/api/payments/pay/appointment/${user.email}`)

        const response = await fetch(`${apiUrl}/api/payments/pay/appointment/${user.email}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bodyTransferencia)
        });

        const result = await response.json();
        console.log(result)

        console.log("Redirigiendo a:", result.sessionUrl);
        console.log("Tipo:", typeof result.sessionUrl);
        console.log("Contiene https?:", result.sessionUrl.includes("https://"));

        if (typeof result.sessionUrl === 'string' && result.sessionUrl.startsWith("https://")) {
          setIdTrans(result.id_compra)
          window.location.href = result.sessionUrl;
        } else {
          alert("URL inválida para redirección");
        }

        if (!result.exito) {
          return;
        }
      }
    } catch (error) {
      console.error('Error al confirmar cita:', error);
      alert('Ocurrió un error al procesar la cita. Inténtalo más tarde.');
    }
  };

  if (!servicio || !fechaSeleccionada) {
    return (
      <>
        <NavBar />
        <div className="container mt-5">{t('missing_data')}</div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <div className="card p-4 shadow-lg">
          <h2 className="text-dark mb-4 text-center">{t('confirm_title_s')}</h2>

          <p><strong>{t('service')}:</strong> {servicio.nombre}</p>
          <p><strong>{t('price')}:</strong> ${servicio.precio.toLocaleString()}</p>
          <p><strong>{t('description')}:</strong> {servicio.descripcion}</p>
          <p><strong>{t('date')}:</strong> {fechaSeleccionada.toLocaleDateString()}</p>
          <p><strong>{t('hour')}:</strong> {fechaSeleccionada.toLocaleTimeString()}</p>

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
              <h5 className="text-primary">{t('sinpe_title')} </h5>
              <div className="bg-white text-dark p-4 rounded">
                <p className="fw-bold">
                  {t('sinpe_instruction')}
                </p>
                <div className="border border-dark p-3 my-3 text-center fs-5 fw-bold">
                  +506  83582929
                </div>
                <p>
                  {t('sinpe_description_s')}
                  {t('sinpe_description2')}
                  {t('sinpe_description3')}<strong>{t('sinpe_description4_s')}</strong> {t('sinpe_description5')}
                  {t('sinpe_description6')}
                </p>
              </div>
            </div>
          )}
          <div className="text-center">
            <button className="btn btn-primary" onClick={handleConfirmacion}>
              {t('confirm_button_s')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayService;
