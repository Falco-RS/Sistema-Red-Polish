import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../common/AuthContext';
import NavBar from '../../common/NavBar'; // <- Importación de la NavBar

const PaymentSuccess = () => {
  const [mensaje, setMensaje] = useState("Procesando tu pago...");
  const navigate = useNavigate();
  const { user, token, idTrans, isCompra } = useAuth();

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'

    const queryParams = new URLSearchParams(window.location.search);
    const paymentId = queryParams.get("paymentId");
    const payerId = queryParams.get("PayerID");

    if (!paymentId || !payerId) {
      setMensaje("Faltan parámetros necesarios para confirmar el pago.");
      return;
    }

    const confirmarPago = async () => {
      try {
        var response;
        if (isCompra) {
          response = await fetch(`${import.meta.env.VITE_IP_API}/api/payments/success/buy/${idTrans}/${user.email}?paymentId=${paymentId}&PayerID=${payerId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });

          if (!response.ok) {
            setMensaje("❌ El servidor rechazó la solicitud de confirmación del pago.");
            return;
          }
        } else {
          response = await fetch(`${import.meta.env.VITE_IP_API}/api/payments/success/appointment/${idTrans}/${user.email}?paymentId=${paymentId}&PayerID=${payerId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });

          if (!response.ok) {
            setMensaje("❌ El servidor rechazó la solicitud de confirmación del pago.");
            return;
          }
        }

        const text = await response.text();
        const result = text ? JSON.parse(text) : null;

        if (result?.status === "Success") {
          setMensaje("✅ ¡Pago confirmado con éxito!.");
          //setTimeout(() => navigate("/mis-citas"), 4000);
        } else {
          setMensaje("❌ El pago no fue aprobado.");
        }
      } catch (error) {
        console.error("Error al confirmar el pago:", error);
        setMensaje("❌ Ocurrió un error al confirmar el pago.");
      }
    };

    confirmarPago();
  }, [navigate, user.email, token]);

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <div className="card p-4 shadow">
          <h3 className="text-center text-danger">{mensaje}</h3>
        </div>
        <div className="text-center mt-4">
          <button
            className="btn btn-outline-primary me-2"
            onClick={() => navigate("/catalog")}
          >
            Ir a comprar productos
          </button>
          <button
            className="btn btn-outline-success"
            onClick={() => navigate("/services")}
          >
            Agendar un servicio
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
