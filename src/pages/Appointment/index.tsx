import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import NavBar from '../../common/NavBar'
import { useNavigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

const Appointment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const servicio = location.state?.servicio

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

  return (
    <>
      <NavBar />
      <div className="container mt-5 d-flex justify-content-center">
        <div
          className="card text-dark p-4 shadow-lg position-relative"
          style={{
            maxWidth: '700px',
            width: '100%',
            backgroundColor: '#f7f7f7', // Fondo neutro
            borderRadius: '10px',
            border: '1px solid #FF6F61', // Borde rojo suave
          }}
        >
          <button
            onClick={() => navigate('/services')}
            className="btn btn-light position-absolute top-0 end-0 m-3"
            style={{
              backgroundColor: '#FF6F61', // Botón rojo
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
          <p><strong>Duración:</strong> {servicio.duracion}</p>
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
        </div>
      </div>
    </>
  )
}

export default Appointment
