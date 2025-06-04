import { useEffect, useState } from 'react'
import { useAuth } from '../common/AuthContext'


const Appoiment = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_IP_API;

  useEffect(() => {
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

  return (
    <div className="container mt-4">
      <h2>Mis Citas</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table table-bordered table-hover mt-3">
        <thead className="thead-dark">
          <tr>
            {user.rol === 'Administrador' && <th>Cliente</th>}
            <th>Servicio</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Acción</th>
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
              <td>₡{cita.service.price.toFixed(2)}</td>
              <td>
                <button className="btn btn-danger btn-sm" disabled>
                  Cancelar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appoiment;