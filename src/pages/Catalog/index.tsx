import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import image from '../../assets/pulido.png'

const Catalog = () => {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API

  useEffect(() => {
    if (user?.user?.rol === 'Administrador') {
      setIsAdmin(true)
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/products/get_all`)
        console.log(`🔎 Estado de respuesta: ${res.status}`)

        if (!res.ok) {
          throw new Error('Error al obtener productos')
        }

        const data = await res.json()
        console.log('✅ Productos obtenidos:', data)

        if (Array.isArray(data) && data.length > 0) {
          setProducts(data)
        } else {
          // Si el backend no devuelve productos válidos, usamos uno quemado
          setProducts([{
            id: 0,
            name: 'Cera Premium',
            description: 'Cera especial, rojo, 150ml',
            price: 2500,
            image: image, // Imagen temporal
          }])
        }
      } catch (err) {
        console.error('❌ Error al obtener productos:', err)
        // Producto quemado como fallback
        setProducts([{
          id: 0,
          name: 'Cera Premium',
          description: 'Cera especial, rojo, 150ml',
          price: 2500,
          image: 'https://via.placeholder.com/150',
        }])
      }
    }

    fetchProducts()
  }, [user])

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <div className="dropdown me-3 mb-2">
            <button className="btn btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Sort by
            </button>
            <ul className="dropdown-menu">
              <li><button className="dropdown-item">Precio</button></li>
              <li><button className="dropdown-item">Nombre</button></li>
              <li><button className="dropdown-item">Nuevos</button></li>
            </ul>
          </div>

          {isAdmin && (
            <button className="btn btn-danger ms-auto" onClick={() => navigate('/add-product')}>
              Agregar Producto
            </button>
          )}
        </div>

        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
          {products.map((product) => (
            <div key={product.id} className="col">
              <div
                className="card shadow-sm position-relative h-100"
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-img-top bg-light d-flex justify-content-center align-items-center" style={{ height: '180px' }}>
                  <img src={product.image} alt={product.name} className="img-fluid" style={{ maxHeight: '100%' }} />
                </div>
                <div className="card-body">
                  <h6 className="card-title fw-bold">{product.name}</h6>
                  <p className="card-text text-muted mb-1">{product.description}</p>
                  <p className="mb-0 fw-bold">₡{product.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Catalog
