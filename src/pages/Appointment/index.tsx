import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import NavBar from '../../common/NavBar'
import 'bootstrap/dist/css/bootstrap.min.css'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { isWeekend } from 'date-fns'
import SelectorHoras from '../../components/HorasDisponibles'

const Appointment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const servicio = location.state?.servicio
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState<Date | null>(null)
  const [confirmado, setConfirmado] = useState(false)
  const [fechaConfirmada] = useState(false)

  const esDiaValido = (date: Date) => !isWeekend(date)

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
            border: '1px solid #007bff',
          }}
        >
          <button
            onClick={() => navigate('/services')}
            className="btn btn-light position-absolute top-0 end-0 m-3"
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              borderRadius: '50%',
              padding: '10px 15px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            Volver
          </button>

          <h2 className="fw-bold mb-4 text-center text-primary">{servicio.nombre}</h2>

          {servicio.imagen && (
            <img
              src={servicio.imagen}
              alt={servicio.nombre}
              className="img-fluid rounded mb-4"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
          )}

          <p><strong>Descripción:</strong> {servicio.descripcion}</p>
          <p><strong>Duración:</strong> {servicio.duracion} minutos</p>
          <p>
            <strong>Precio:</strong>{' '}
            {servicio.precioFinal ? (
              <>
                ${servicio.precioFinal}{' '}
                <span className="text-decoration-line-through text-muted">${servicio.precio}</span>{' '}
                <span className="text-primary">{Math.round(servicio.porcentajeDescuento * 100)}%</span>
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
                  const nuevaFecha = new Date(date)
                  nuevaFecha.setHours(8, 0, 0, 0)
                  setFechaSeleccionada(nuevaFecha)
                  setHoraSeleccionada(null)
                  setConfirmado(false)
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
              <SelectorHoras
                servicio={servicio}
                fechaSeleccionada={fechaSeleccionada}
                horaSeleccionada={horaSeleccionada}
                setHoraSeleccionada={setHoraSeleccionada}
              />
            </div>
          )}

          <div className="mt-4 text-center">
            {horaSeleccionada && confirmado ? (
              <>
                <h5 className="text-primary">Fecha y hora seleccionadas:</h5>
                <p>{horaSeleccionada.toLocaleString()}</p>
                <button
                  className="btn btn-outline-secondary mb-3"
                  onClick={() => setConfirmado(false)}
                >
                  Cambiar fecha y hora
                </button>
                <br />
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate('/pay-service', {
                      state: {
                        servicio,
                        fechaSeleccionada: horaSeleccionada
                      }
                    })
                  }
                >
                  Ir a pagar
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (horaSeleccionada) {
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
