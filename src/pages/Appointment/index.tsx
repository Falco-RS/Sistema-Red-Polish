import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import NavBar from '../../common/NavBar'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { isWeekend } from 'date-fns'

const Appointment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const servicio = location.state?.servicio
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [confirmado, setConfirmado] = useState(false)
  const [horaSeleccionada, setHoraSeleccionada] = useState<Date | null>(null)
  const [fechaConfirmada] = useState(false);
  const [horasNoDisponibles, setHorasNoDisponibles] = useState<number[]>([])

  const horasDisponibles = [8, 9, 10, 11, 12, 13, 14, 15, 16]

  // Función para verificar si la fecha y hora están disponibles
  const estaDisponible = (fecha: Date) => {
    const horaSeleccionada = fecha.getHours();
    const duracionEnHoras = Math.ceil(servicio.duracion / 60);

    // Validar cada hora que cubriría el servicio
    for (let i = 0; i < duracionEnHoras; i++) {
      const hora = horaSeleccionada + i;
      if (horasNoDisponibles.includes(hora)) {
        return false;
      }
    }

    return true;
  };

  
  useEffect(() => {
      const obtenerHorasNoDisponibles = async () => {
        if (fechaSeleccionada && servicio?.id) {
          const fechaISO = fechaSeleccionada.toISOString().split('T')[0];
          try {
            const response = await fetch(`http://localhost:8080/api/citas/ocupadas?servicio_id=${servicio.id}&fecha=${fechaISO}`);
            if (!response.ok) throw new Error('Error al obtener datos de disponibilidad');
            const data = await response.json();
            setHorasNoDisponibles(data); // espera un array de números, por ejemplo [9, 10, 14]
          } catch (error) {
            console.error('Error al obtener horas no disponibles:', error);
            setHorasNoDisponibles([]); // fallback
          }
        } else {
          setHorasNoDisponibles([]);
        }
      };

      obtenerHorasNoDisponibles();
    }, [fechaSeleccionada, servicio]);

  // Función para filtrar los días no disponibles (fines de semana)
  const esDiaValido = (date: Date) => {
    return !isWeekend(date); 
  }

  // Definir las fechas de inicio y fin para las horas de 8 AM a 5 PM
  const minTime = new Date()
  minTime.setHours(8, 0, 0, 0) 

  const maxTime = new Date()
  maxTime.setHours(17, 0, 0, 0) 

  return (
    <>
      <NavBar />
      <div className="container mt-5 d-flex justify-content-center">
        <div
          className="card text-dark p-4 shadow-lg position-relative"
          style={{
            maxWidth: '700px',
            width: '100%',
            backgroundColor: '#f7f7f7',
            borderRadius: '10px',
            border: '1px solid #FF6F61',
          }}
        >
          <button
            onClick={() => navigate('/services')}
            className="btn btn-light position-absolute top-0 end-0 m-3"
            style={{
              backgroundColor: '#FF6F61',
              color: '#fff',
              borderRadius: '50%',
              padding: '10px 15px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            Volver
          </button>

          <h2 className="fw-bold mb-4 text-center text-danger">{servicio.nombre}</h2>

          {servicio.imagen && (
            <img
              src={servicio.imagen}
              alt={servicio.nombre}
              className="img-fluid rounded mb-4"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
          )}

          <p><strong>Descripción:</strong> {servicio.descripcion}</p>
          <p><strong>Duración:</strong> {servicio.duracion} </p>
          <p>
            <strong>Precio:</strong>{' '}
            {servicio.precioFinal ? (
              <>
                ${servicio.precioFinal}{' '}
                <span className="text-decoration-line-through text-muted">${servicio.precio}</span>{' '}
                <span className="text-danger">{Math.round(servicio.porcentajeDescuento * 100)}%</span>
              </>
            ) : (
              <>${servicio.precio}</>
            )}
          </p>

          <div className="mt-4">
            <h4>Selecciona la fecha</h4>
            <DatePicker
            selected={fechaSeleccionada}
            onChange={(date) => {
              if (date && !fechaConfirmada) {  
                const newDate = new Date(date);
                newDate.setHours(8, 0, 0, 0);
                setFechaSeleccionada(newDate);
                setHoraSeleccionada(null);
                setConfirmado(false);
              }
            }}
            dateFormat="MMMM d, yyyy"
            minDate={new Date()}
            filterDate={esDiaValido}
            placeholderText="Selecciona una fecha"
            inline
            disabled={fechaConfirmada}  
          />
          </div>

          {fechaSeleccionada && (
            <div className="mt-4">
              <h4>Selecciona una hora</h4>
              <div className="d-flex flex-wrap gap-2">
                {horasDisponibles.map((hora) => {
                  const horaCompleta = new Date(fechaSeleccionada)
                  horaCompleta.setHours(hora, 0, 0, 0)

                  const horaFormateada = horaCompleta.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  const disponible = estaDisponible(horaCompleta)

                  return (
                    <button
                      key={hora}
                      className={`btn ${
                        horaSeleccionada &&
                        horaCompleta.getHours() === horaSeleccionada.getHours()
                          ? 'btn-danger'
                          : 'btn-outline-danger'
                      }`}
                      onClick={() => disponible && setHoraSeleccionada(horaCompleta)}
                      disabled={!disponible}
                    >
                      {horaFormateada}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            {horaSeleccionada && confirmado ? (
              <>
                <h5 className="text-danger">Fecha y hora seleccionadas:</h5>
                <p>{horaSeleccionada.toLocaleString()}</p>
                <button
                  className="btn btn-outline-secondary mb-3"
                  onClick={() => setConfirmado(false)}
                >
                  Cambiar fecha y hora
                </button>
                <br />
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    navigate('/pay-service', { state: { servicio, fechaSeleccionada: horaSeleccionada } })
                  }
                >
                  Ir a pagar
                </button>
              </>
            ) : (
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (horaSeleccionada && estaDisponible(horaSeleccionada)) {
                    setConfirmado(true)
                  } else {
                    alert('Selecciona una hora válida.')
                  }
                }}
                disabled={!horaSeleccionada}
              >
                Confirmar selección de fecha y hora
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )

}

export default Appointment
