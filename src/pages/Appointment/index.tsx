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

  const noDisponibles = [
    { fecha: '2025-05-13', horas: [9, 10, 14] }, 
    { fecha: '2025-05-14', horas: [13, 15] },   
  ]

  // Función para verificar si la fecha y hora están disponibles
  const estaDisponible = (fechaSeleccionada: Date) => {
    const fechaString = fechaSeleccionada.toISOString().split('T')[0] 
    const horaSeleccionada = fechaSeleccionada.getHours() 
    for (const noDisponible of noDisponibles) {
      if (noDisponible.fecha === fechaString && noDisponible.horas.includes(horaSeleccionada)) {
        return false 
      }
    }
    return true 
  }
  
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

  // Función para manejar la selección de la fecha
  const handleSelectDate = (date: Date | null) => {
    if (date) {
      // Asegurarse de que la hora esté en el rango de 8 AM a 5 PM
      const selectedDate = new Date(date)
      const hours = selectedDate.getHours()

      if (!estaDisponible(selectedDate)) {
        alert('La fecha y hora seleccionadas no están disponibles. Por favor elige otra.');
        return;
      }

      if (hours < 8) {
        selectedDate.setHours(8, 0, 0, 0) 
      } else if (hours > 17) {
        selectedDate.setHours(17, 0, 0, 0)
      }

      setFechaSeleccionada(selectedDate)
    } else {
      setFechaSeleccionada(null)
    }
  }

  // Definir las fechas de inicio y fin para las horas de 8 AM a 5 PM
  const minTime = new Date()
  minTime.setHours(8, 0, 0, 0) 

  const maxTime = new Date()
  maxTime.setHours(17, 0, 0, 0) 

  // Función que genera un arreglo de objetos Date a excluir para un día específico
  const obtenerHorasNoDisponibles = (date: Date): Date[] => {
    const fechaString = date.toISOString().split('T')[0];
    const horasNoDisponibles = noDisponibles.find(d => d.fecha === fechaString)?.horas || [];

    return horasNoDisponibles.map(hora => {
      const excluida = new Date(date);
      excluida.setHours(hora, 0, 0, 0);
      return excluida;
    });
  };

  // Nueva función que extiende la lógica para bloquear bloques incompletos
    const obtenerTodasLasHorasExcluidas = (date: Date): Date[] => {
    const horasExcluidas = obtenerHorasNoDisponibles(date);
    const horasOcupadas = noDisponibles.find(d => d.fecha === date.toISOString().split('T')[0])?.horas || [];

    const duracion = servicio.duracion || 60; // minutos
    const bloquesNecesarios = Math.ceil(duracion / 60);

    const horaFinalPermitida = 17; // 5 PM

    for (let hora = 8; hora <= horaFinalPermitida; hora++) {
      // Si el bloque se pasa del horario permitido (por ejemplo, termina a las 18), excluirlo
      const horaUltimaRequerida = hora + bloquesNecesarios - 1;
      const sePasaDelHorario = horaUltimaRequerida > horaFinalPermitida;

      const bloqueIncompleto = Array.from({ length: bloquesNecesarios }, (_, i) => hora + i)
        .some(h => horasOcupadas.includes(h));

      if (sePasaDelHorario || bloqueIncompleto) {
        const excluida = new Date(date);
        excluida.setHours(hora, 0, 0, 0);
        if (!horasExcluidas.find(h => h.getHours() === excluida.getHours())) {
          horasExcluidas.push(excluida);
        }
      }
    }

    return horasExcluidas;
  };

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
          <p><strong>Duración:</strong> {servicio.duracion} min </p>
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
            <h4>Selecciona la fecha y hora para tu cita</h4>
            <DatePicker
              selected={fechaSeleccionada}
              onChange={handleSelectDate}
              showTimeSelect
              timeIntervals={60}
              timeCaption="Hora"
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              filterDate={esDiaValido}
              placeholderText="Selecciona una fecha"
              inline
              maxTime={maxTime}
              minTime={minTime}
              excludeTimes={fechaSeleccionada ? obtenerTodasLasHorasExcluidas(fechaSeleccionada) : []}
            />
          </div>

          {/* Botón habilitado solo si hay fecha seleccionada */}
          <div className="mt-4 text-center">
            {fechaSeleccionada ? (
              <button
                className="btn btn-danger"
                onClick={() => setConfirmado(true)}
              >
                Confirmar selección de fecha y hora
              </button>
            ) : (
              <button className="btn btn-secondary" disabled>
                Seleccionar fecha y hora
              </button>
            )}
          </div>

          {/* Si la fecha y hora están confirmadas, mostrar detalles */}
          {confirmado && fechaSeleccionada && (
            <div className="mt-4 text-center">
              <h5 className="text-success">Fecha y hora seleccionadas:</h5>
              <p>{fechaSeleccionada.toLocaleString()}</p>
              <button
                className="btn btn-outline-secondary mb-3"
                onClick={() => setConfirmado(false)}
              >
                Cambiar fecha y hora
              </button>
              <br />
              <button
                className="btn btn-success"
                onClick={() => navigate('/pago', { state: { servicio, fechaSeleccionada } })}
              >
                Ir a pagar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Appointment
