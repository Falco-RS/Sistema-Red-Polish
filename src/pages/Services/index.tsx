import { useState, useEffect } from 'react'
import NavBar from '../../common/NavBar'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Servicio, Categoria, ServicioConPrecio } from '../../common/interfaces'
import { useAuth } from '../../common/AuthContext' // Asegúrate de tener este hook implementado

const mockCategorias: Categoria[] = [
  { id: 1, nombre: 'Lavado' },
  { id: 2, nombre: 'Pulido' },
  { id: 3, nombre: 'Desinfección' },
]

const obtenerDescuentoSimulado = (id_promocion: number): number => {
  if (id_promocion === 1) return 0.15
  if (id_promocion === 2) return 0.3
  return 0
}

const Services = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [servicios, setServicios] = useState<ServicioConPrecio[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null)
  const navigate = useNavigate()

  const manejarAgendar = (servicio: ServicioConPrecio) => {
    navigate('/appointment', { state: { servicio } })
  }

  const manejarModificar = (servicio: ServicioConPrecio) => {
    navigate('/edit-service', { state: { servicio } })
  }


  useEffect(() => {
    if (user?.user?.rol === 'Administrador') {
    setIsAdmin(true)
    }

    fetch('http://localhost:8080/api/services/get-services')
    .then(res => {
      if (!res.ok) {
        throw new Error('Error al obtener los servicios')
      }
      return res.json()
    })
    .then((data) => {
      const serviciosTransformados: ServicioConPrecio[] = data.map((serv: any) => {
        const id_promocion = serv.promotion ? parseInt(serv.promotion) : undefined
        const id_categoria = parseInt(serv.category)

        const baseServicio: Servicio = {
          id: serv.id,
          nombre: serv.name,
          id_categoria,
          descripcion: serv.description,
          duracion: serv.duration,
          precio: serv.price,
          id_promocion,
          imagen: '', // Puedes llenar esto si más adelante agregas imágenes desde la API
        }

        if (id_promocion) {
          const descuento = obtenerDescuentoSimulado(id_promocion)
          const precioFinal = Math.round(serv.price * (1 - descuento))
          return {
            ...baseServicio,
            precioFinal,
            porcentajeDescuento: descuento,
          }
        }

        return baseServicio
      })

      setServicios(serviciosTransformados)
    })
    .catch(error => {
      console.error('Error al cargar servicios:', error)
    })

  setCategorias(mockCategorias)

  }, [user])

  const serviciosFiltrados = categoriaSeleccionada
    ? servicios.filter(s => s.id_categoria === categoriaSeleccionada)
    : servicios

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-dark">Catálogo de Servicios</h4>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Categorías
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setCategoriaSeleccionada(null)}>Todas</Dropdown.Item>
              {categorias.map(cat => (
                <Dropdown.Item key={cat.id} onClick={() => setCategoriaSeleccionada(cat.id)}>
                  {cat.nombre}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

       {/* Aquí podrías mostrar un botón solo para admins si lo necesitas */}
        {isAdmin && (
          <div className="mb-3 d-flex justify-content-end gap-2">
            <button 
              className="btn btn-danger" 
              onClick={() => navigate('/add-service')}
            >
              Agregar Servicio
            </button>
            
            <button 
              className="btn btn-warning" 
              onClick={() => navigate('/modify-calendar')}
            >
              Modificar Calendario
            </button>
          </div>
        )}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {serviciosFiltrados.map(servicio => (
            <div key={servicio.id} className="col">
              <div className="card shadow-sm h-100" style={{ maxWidth: '300px', margin: '0 auto' }}>
                {servicio.imagen && (
                  <img
                    src={servicio.imagen}
                    alt={servicio.nombre}
                    className="card-img-top"
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{servicio.nombre}</h5>
                  <p className="card-text">{servicio.descripcion}</p>
                  <p className="card-text"><strong>Duración:</strong> {servicio.duracion} min</p>
                  <p className="mb-2 fw-bold">
                    {servicio.precioFinal ? (
                      <>
                        ${servicio.precioFinal}{' '}
                        <span className="text-decoration-line-through text-muted">${servicio.precio}</span>{' '}
                        <span className="text-danger">{Math.round(servicio.porcentajeDescuento! * 100)}%</span>
                      </>
                    ) : (
                      <>${servicio.precio}</>
                    )}
                  </p>
                  <button
                    className="btn"
                    style={{
                      backgroundColor: '#d9534f', // rojo para ambos casos
                      color: 'white',
                      border: 'none',
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      transition: 'background-color 0.3s ease',
                    }}
                    onClick={() =>
                      isAdmin ? manejarModificar(servicio) : manejarAgendar(servicio)
                    }
                  >
                    {isAdmin ? 'Modificar servicio' : 'Agendar cita'}
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Services