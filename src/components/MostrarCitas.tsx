import { useEffect, useState } from 'react'
import { useAuth } from '../common/AuthContext'
import { useTranslation } from 'react-i18next';


const Appoiment = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_IP_API;
  const { t } = useTranslation('global');


  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'

    const fetchAppointments = async () => {
      try {
        const url =
          user.rol === 'Administrador'
            ? `${apiUrl}/api/citas/get_all`
            : `${apiUrl}/api/citas/get/${user.id}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || 'Error al obtener las citas.');
          return;
        }

        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        console.error(err);
        setError('Error de red al obtener las citas.');
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);


  const handleConfirm = async (citaId: number) => {
  try {
    const response = await fetch(`${apiUrl}/api/citas/update-state/${citaId}/${user.email}/CONFIRMADA`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
        const err = await response.json();
        setError(err.message || 'Error al confirmar la cita.');
        return;
      }

    const updated = await response.json();
    setAppointments(prev =>
      prev.map(cita =>
        cita.id === updated.id ? { ...cita, state: updated.state } : cita
      )
    );

  } catch (err) {
    console.error(err);
    setError('Error de red al confirmar el pago.');
  }
};


  const handleCancel = async (citaId: number) => {
    try {
      const endpoint = user.rol === 'Administrador'
        ? `${apiUrl}/api/citas/cancel_admin/${citaId}/${user.email}`
        : `${apiUrl}/api/citas/cancel/${citaId}/${user.email}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.message || 'Error al cancelar la cita.');
        return;
      }

    const updated = await response.json();
      setAppointments(prev =>
        prev.map(cita =>
          cita.id === updated.id ? { ...cita, state: updated.state } : cita
        )
      );

    if (user.rol !== 'Administrador') {
      alert('Su cancelación está pendiente. Por favor contacte al administrador al +506 8358 2929 para la devolución y tener una cancelación exitosa.');
    }
    } catch (err) {
      console.error(err);
      setError('Error de red al cancelar la cita.' );
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4" style={{ color: '#333' }}>{t('my_appointments')}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table table-bordered table-hover mt-3">
        <thead className="thead-dark">
          <tr>
            {user.rol === 'Administrador' && <th>{t('client')}</th>}
            <th>{t('service')}</th>
            <th>{t('date')}</th>
            <th>{t('hour')}</th>
            <th>{t('status')}</th>
            <th>{t('total')}</th>
            <th>{t('action')}</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((cita) => (
            <tr key={cita.id}>
              {user.rol === 'Administrador' && (
                <td>{cita.user.name} {cita.user.last_name}</td>
              )}
              <td>{cita.service.name}</td>
              <td>{cita.date}</td>
              <td>{cita.hour}</td>
              <td>{cita.state}</td>
              <td>${cita.service.price.toFixed(2)}</td>
              <td>
                {/* CONFIRMAR PAGO SOLO PARA ADMIN EN ESTADO PENDIENTE */}
                {user.rol === 'Administrador' && cita.state === 'PENDIENTE' && (
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={async () => {
                      await handleConfirm(cita.id);
                    }}
                  >
                    {t('confirm_payment')}
                  </button>
                )}

                {/* CANCELAR si está PENDIENTE o CONFIRMADA */}
                {(cita.state === 'PENDIENTE' || cita.state === 'CONFIRMADA') && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancel(cita.id)}
                  >
                    {t('cancel')}
                  </button>
                )}

                {/* CONFIRMAR CANCELACIÓN si es CANCELADA PENDIENTE y el admin la ve */}
                {cita.state === 'CANCELADA PENDIENTE' && user.rol === 'Administrador' && (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleCancel(cita.id)}
                  >
                    {t('confirm_cancellation')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appoiment;