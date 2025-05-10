import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css'

const categories = ['Abrillantador', 'Ceras', 'Ventanas', 'etc']

const Catalog = () => {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<any[]>([])

  const navigate = useNavigate()

  useEffect(() => {
    if (user?.user?.rol === 'Administrador') {
      setIsAdmin(true)
    }

    // Simular productos quemados
    const dummyProducts = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      name: 'Cera Premium',
      description: 'Cera especial, rojo, 150ml',
      price: 2500,
      originalPrice: i % 2 === 0 ? 5000 : null,
      isNew: i % 3 === 0,
      discount: i % 2 === 0 ? '50%' : null,
    }))
    setProducts(dummyProducts)
  }, [user])

  const handleEdit = (product: any) => {
    // Aquí más adelante puedes usar navigate con estado
    console.log('Editar producto:', product)
  }

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

          <div className="d-flex flex-wrap gap-2 mb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn ${selectedCategory === cat ? 'btn-dark text-white' : 'btn-light border'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button className="btn btn-danger ms-auto" onClick={() => navigate('/add-product')}>
              Agregar Producto
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-center text-muted">Por el momento no hay productos.</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            {products.map((product) => (
              <div key={product.id} className="col">
                <div
                  className="card shadow-sm position-relative h-100"
                  onClick={() => isAdmin ? handleEdit(product) : navigate(`/product/${product.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {product.isNew && (
                    <span className="badge bg-dark position-absolute top-0 end-0 m-2">NEW</span>
                  )}
                  <div className="card-img-top bg-light d-flex justify-content-center align-items-center" style={{ height: '180px' }}>
                    <span className="text-muted">Imagen</span>
                  </div>
                  <div className="card-body">
                    <h6 className="card-title fw-bold">{product.name}</h6>
                    <p className="card-text text-muted mb-1">{product.description}</p>
                    <p className="mb-0 fw-bold">
                      ${product.price}
                      {product.originalPrice && (
                        <>
                          {' '}
                          <span className="text-decoration-line-through text-muted">${product.originalPrice}</span>
                          {' '}
                          <span className="text-danger">-{product.discount}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Catalog
