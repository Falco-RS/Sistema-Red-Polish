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
  const horasDisponibles = [8, 9, 10, 11, 12, 13, 14, 15, 16]


  const noDisponibles = [
    { fecha: '2025-05-13', horas: [9, 10, 14] }, 
    { fecha: '2025-05-14', horas: [13, 15] },   
  ]

  // Función para verificar si la fecha y hora están disponibles
  const estaDisponible = (fechaSeleccionada: Date) => {
    const fechaString = fechaSeleccionada.toISOString().split('T')[0];
    const horaSeleccionada = fechaSeleccionada.getHours();
    
    // Comprobamos si la hora inicial está bloqueada
    for (const noDisponible of noDisponibles) {
      if (noDisponible.fecha === fechaString && noDisponible.horas.includes(horaSeleccionada)) {
        return false;  // Si está bloqueada, no es disponible
      }
    }

    // Si el servicio dura más de una hora, verificamos las horas adicionales
    const duracionEnHoras = Math.ceil(servicio.duracion / 60); // Redondea hacia arriba
    
    for (let i = 1; i < duracionEnHoras; i++) {
      const horaAdicional = new Date(fechaSeleccionada);
      horaAdicional.setHours(horaSeleccionada + i, 0, 0, 0);
      const horaAdicionalString = horaAdicional.toISOString().split('T')[0];

      // Verificamos si alguna de las horas adicionales está bloqueada
      for (const noDisponible of noDisponibles) {
        if (noDisponible.fecha === horaAdicionalString && noDisponible.horas.includes(horaAdicional.getHours())) {
          return false;  // Si alguna hora adicional está bloqueada, no es disponible
        }
      }
    }

    return true; // Si todo está disponible, retorna true
  };

  
  useEffect(() => {
    if (!servicio) {
      console.warn('No se recibió ningún servicio')
    }
  }, [servicio])

  if (!servicio) {
    return (
      <>
        <NavBar />
        <div className="container mt-5">No se encontró información del servicio.</div>
      </>
    )
  }

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
              if (date && !fechaConfirmada) {  // Solo permitir seleccionar una fecha si no está confirmada
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
            disabled={fechaConfirmada}  // Deshabilitar el selector de fecha si está confirmada
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
                    navigate('/pago', { state: { servicio, fechaSeleccionada: horaSeleccionada } })
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
