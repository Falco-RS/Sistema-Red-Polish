import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import image from '../../assets/pulido.png'

const Catalog = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API

  useEffect(() => {
    if (user?.rol === 'Administrador') {
      setIsAdmin(true)
    }

    fetchProducts()
    fetchCategories()
  }, [user])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/products/get_all`)
      if (!res.ok) throw new Error('Error al obtener productos')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data)
        setFilteredProducts(data)
      } else {
        setProducts([getFallbackProduct()])
        setFilteredProducts([getFallbackProduct()])
      }
    } catch (err) {
      console.error('❌ Error al obtener productos:', err)
      setProducts([getFallbackProduct()])
      setFilteredProducts([getFallbackProduct()])
    }
  }

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

  const getFallbackProduct = () => ({
    id: 0,
    name: 'Cera Premium',
    description: 'Cera especial, rojo, 150ml',
    price: 2500,
    image: image,
    categoryId: 1
  })

  const handleCategoryFilter = (categoryId: number) => {
    setSelectedCategory(categoryId)
    const filtered = products.filter(p => p.categoryId === categoryId)
    setFilteredProducts(filtered)
  }

  const clearFilter = () => {
    setSelectedCategory(null)
    setFilteredProducts(products)
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
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`btn ${selectedCategory === cat.id ? 'btn-dark text-white' : 'btn-light border'}`}
                onClick={() => handleCategoryFilter(cat.id)}
              >
                {cat.name}
              </button>
            ))}

            {selectedCategory !== null && (
              <button className="btn btn-outline-secondary" onClick={clearFilter}>
                Limpiar filtro
              </button>
            )}
          </div>

          {isAdmin && (
            <button className="btn btn-danger ms-auto" onClick={() => navigate('/add-product')}>
              Agregar Producto
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-muted">No hay productos para esta categoría.</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            {filteredProducts.map(product => (
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
        )}
      </div>
    </>
  )
}

export default Catalog
