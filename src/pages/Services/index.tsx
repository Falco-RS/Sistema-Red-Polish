import { useState, useEffect } from 'react'
import NavBar from '../../common/NavBar'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Servicio, Categoria, ServicioConPrecio } from '../../common/Interfaces'

const mockServicios: Servicio[] = [
  {
    id: 1,
    nombre: 'Lavado completo',
    id_categoria: 1,
    descripcion: 'Lavado exterior e interior del vehículo.',
    duracion: '60',
    precio: 15000,
    id_promocion: 2,
    imagen: 'https://resizer.glanacion.com/resizer/v2/lavado-de-BS652MZB7JBQ3CGT3CJP6TNVXQ.jpg?auth=b79423526cf1668dd2ac008b5edddf58df5fbd468b1187aae1342c137b527fe3&width=1280&height=854&quality=70&smart=true',
  },
  {
    id: 2,
    nombre: 'Pulido de pintura',
    id_categoria: 2,
    descripcion: 'Mejora el brillo y elimina rayones superficiales.',
    duracion: '120',
    precio: 30000,
    imagen: 'https://www.rojassa.com/wp-content/uploads/2018/03/pulido-de-autos.jpg',
  },
  {
    id: 3,
    nombre: 'Desinfección interior',
    id_categoria: 3,
    descripcion: 'Limpieza profunda de asientos y superficies internas.',
    duracion: '90',
    precio: 20000,
    id_promocion: 1,
    imagen: 'https://gacetamedica.com/wp-content/uploads/2020/06/GettyImages-1217555995.jpg',
  },
]

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
  const [servicios, setServicios] = useState<ServicioConPrecio[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null)
  const navigate = useNavigate()

  const manejarAgendar = (servicio: ServicioConPrecio) => {
    navigate('/appointment', { state: { servicio } })
  }

  useEffect(() => {
    const serviciosConPrecio: ServicioConPrecio[] = mockServicios.map(serv => {
      if (serv.id_promocion) {
        const descuento = obtenerDescuentoSimulado(serv.id_promocion)
        const precioFinal = Math.round(serv.precio * (1 - descuento))
        return { ...serv, precioFinal, porcentajeDescuento: descuento }
      }
      return serv
    })
    setServicios(serviciosConPrecio)
    setCategorias(mockCategorias)
  }, [])

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
                      backgroundColor: '#d9534f',
                      color: 'white',
                      border: 'none',
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      transition: 'background-color 0.3s ease',
                    }}
                    onClick={() => manejarAgendar(servicio)}
                  >
                    Agendar cita
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
