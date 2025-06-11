import { useState, useEffect } from 'react'
import NavBar from '../../common/NavBar'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Servicio, ServicioConPrecio } from '../../common/interfaces'
import { useAuth } from '../../common/AuthContext' 
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('global');

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
    document.body.style.backgroundColor = '#ffffff'

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
      fetchServices()
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
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h4 className="fw-bold text-dark mb-2">{t('title_service')}</h4>
        <Dropdown className="mb-2">
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic" className="text-dark">
            {t('filter_sort')}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setCategoriaSeleccionada(null)}>{t('all_categories')}</Dropdown.Item>
            {categories.map(cat => (
              <Dropdown.Item key={cat.id} onClick={() => setCategoriaSeleccionada(cat.id)}>
                {cat.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {isAdmin && (
          <div className="d-flex flex-wrap gap-2 ms-auto mb-2">
            <button className="btn btn-primary" onClick={() => navigate('/add-service')}>
              {t('add_service')}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/edit-calendar')}>
              {t('edit_calendar')}
            </button>
          </div>
        )}
      </div>

      {serviciosFiltrados.length === 0 ? (
        <p className="text-center text-muted">{t('no_services')}</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
          {serviciosFiltrados.map(servicio => {
            const promocion = promotions.find(promo => promo.id === servicio.id_promocion)

            return (
              <div key={servicio.id} className="col">
                <div
                  className="card shadow-sm position-relative h-100"
                  onClick={() => {
                    if (!user) {
                      alert(t('login_required'));
                      return;
                    }

                    if (isAdmin) {
                      manejarModificar(servicio);
                    } else {
                      manejarAgendar(servicio);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {promocion && (
                    <span className="badge bg-danger position-absolute top-0 start-0 m-2" title={promocion.title}>
                      {promocion.title}
                    </span>
                  )}

                  <div
                    className="card-img-top bg-light d-flex justify-content-center align-items-center"
                    style={{ height: '180px' }}
                  >
                    {servicio.imagen && (
                      <img
                        src={servicio.imagen}
                        alt={servicio.nombre}
                        className="img-fluid"
                        style={{ maxHeight: '100%' }}
                      />
                    )}
                  </div>

                  <div className="card-body">
                    <h6 className="card-title fw-bold">{servicio.nombre}</h6>
                    <p className="card-text text-muted mb-1">{servicio.descripcion}</p>
                    <p className="card-text mb-1"><strong>{t('duration')}:</strong> {servicio.duracion} min</p>

                    {servicio.id_promocion && servicio.porcentajeDescuento ? (
                      <div>
                        <span className="text-muted text-decoration-line-through me-2">
                          ${Math.round(servicio.precio / (1 - servicio.porcentajeDescuento / 100)).toLocaleString()}
                        </span>
                        <span className="fw-bold text-danger">
                          ${servicio.precio.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <p className="mb-0 fw-bold">${servicio.precio.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  </>
)
}

export default Services
