import { useState, useEffect } from 'react'
import NavBar from '../../common/NavBar'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Servicio, ServicioConPrecio } from '../../common/interfaces'
import { useAuth } from '../../common/AuthContext' 

type Promotion = {
  id: number
  title: string
  porcentage?: number
}

const Services = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [servicios, setServicios] = useState<ServicioConPrecio[]>([])
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([])  
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API;

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/categories/get_categories`)
      if (!res.ok) throw new Error('Error al obtener categorías')
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error('❌ Error al obtener categorías:', err)
    }
  }

  const fetchPromotions = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/promotions`)
      if (!response.ok) throw new Error('Error al obtener promociones')
      const data = await response.json()
      setPromotions(data)
    } catch (err) {
      console.error('❌ Error al obtener promociones:', err)
    }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/services/get_all`)
      if (!res.ok) throw new Error('Error al obtener los servicios')
      const data = await res.json()

      // Ahora que tenemos promociones cargadas, asignamos precio con descuento
      const serviciosTransformados: ServicioConPrecio[] = data.map((serv: any) => {
        const id_promocion = serv.promotionId ? parseInt(serv.promotionId) : undefined
        const id_categoria = parseInt(serv.categoryId)

        const baseServicio: Servicio = {
          id: serv.id,
          nombre: serv.name,
          id_categoria,
          descripcion: serv.description,
          duracion: serv.duration,
          precio: serv.price,
          id_promocion,
          imagen: serv.imageUrl || '',
        }

        const promotion = promotions.find((promo) => promo.id === id_promocion)
        if (promotion && promotion.porcentage) {
          const descuento = promotion.porcentage
          const precioFinal = Math.round(serv.price * (1 - descuento / 100))
          return {
            ...baseServicio,
            precioFinal,
            porcentajeDescuento: descuento,
          }
        }

        // Sin promoción, solo el precio base
        return baseServicio
      })

      setServicios(serviciosTransformados)
    } catch (error) {
      console.error('Error al cargar servicios:', error)
    }
  }

  useEffect(() => {
    if (user?.rol === 'Administrador') {
      setIsAdmin(true)
    }

    fetchCategories()
    fetchPromotions()
    // Aquí esperamos que promociones ya estén cargadas antes de cargar servicios:
    // Pero fetchPromotions es async, así que mejor usar otro useEffect para servicios
  }, [user])

  // Este useEffect ejecuta fetchServices cuando promotions estén listas
  useEffect(() => {
    if (promotions.length > 0) {
      fetchServices()
    }
  }, [promotions])

  const manejarAgendar = (servicio: ServicioConPrecio) => {
    navigate('/appointment', { state: { servicio } })
  }

  const manejarModificar = (servicio: ServicioConPrecio) => {
    navigate('/edit-service', { state: { servicio } })
  }

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
              {categories.map(cat => (
                <Dropdown.Item key={cat.id} onClick={() => setCategoriaSeleccionada(cat.id)}>
                  {cat.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

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
              onClick={() => navigate('/edit-calendar')}
            >
              Modificar Calendario
            </button>
          </div>
        )}

        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
          {serviciosFiltrados.map(servicio => (
            <div key={servicio.id} className="col">
              <div className="card shadow-sm h-100">
                {servicio.id_promocion && (
                  <div className="bg-danger text-white text-center fw-bold py-1 rounded-top">
                    {promotions.find(promo => promo.id === servicio.id_promocion)?.title || 'Promoción'}
                  </div>
                )}

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

                  {servicio.id_promocion && servicio.porcentajeDescuento ? (
                  <div>
                    {/* Precio original calculado */}
                    <span className="text-muted text-decoration-line-through me-2">
                      ${Math.round(servicio.precio / (1 - servicio.porcentajeDescuento / 100)).toLocaleString()}
                    </span>
                    {/* Precio con descuento */}
                    <span className="fw-bold text-danger">
                      ${servicio.precio.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <p className="mb-0 fw-bold">${servicio.precio.toLocaleString()}</p>
                )}

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
