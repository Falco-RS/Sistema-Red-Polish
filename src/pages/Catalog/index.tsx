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
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [promotions, setPromotions] = useState<any[]>([])

  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API

  useEffect(() => {
    if (user?.rol === 'Administrador') setIsAdmin(true)
    fetchProducts()
    fetchCategories()
    fetchPromotions()
  }, [user])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/products/get_all`)
      const data = await res.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      setProducts([getFallbackProduct()])
      setFilteredProducts([getFallbackProduct()])
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/categories/get_categories`)
      const data = await res.json()
      setCategories(data)
      console.log(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/promotions`)
      const data = await res.json()
      setPromotions(data)
    } catch (err) {
      console.error(err)
    }
  }

  const getFallbackProduct = () => ({
    id: 0,
    name: 'Cera Premium',
    description: 'Cera especial, rojo, 150ml',
    price: 2500,
    image: image,
    categoryId: 1,
  })

  const handleCategoryFilter = (id: number) => {
    setSelectedCategory(id)
    const filtered = products.filter(p => p.categoryId === id)
    setFilteredProducts(filtered)
  }

  const clearFilter = () => {
    setSelectedCategory(null)
    setFilteredProducts(products)
  }

  const sortProducts = (type: string) => {
    const sorted = [...filteredProducts]
    if (type === 'price') sorted.sort((a, b) => a.price - b.price)
    if (type === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    if (type === 'newest') sorted.sort((a, b) => b.id - a.id)
    setFilteredProducts(sorted)
  }

  return (
  <>
    <NavBar />
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div className="dropdown me-3 mb-2">
          <button
            className="btn btn-outline-dark dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Filtrar / Ordenar
          </button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <div className="dropdown-divider"></div>
            <button className="dropdown-item" onClick={clearFilter}>Todas las categorías</button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className="dropdown-item"
                onClick={() => handleCategoryFilter(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {isAdmin && (
          <button className="btn btn-primary ms-auto" onClick={() => navigate('/add-product')}>
            Agregar Producto
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-muted">No hay productos para esta categoría.</p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-4">
          {filteredProducts.map((product) => {
            const promotion = promotions.find(p => p.id === product.promotionId)
            return (
              <div key={product.id} className="col">
                <div
                  className="card shadow-sm h-100"
                  style={{ minHeight: '300px', cursor: 'pointer' }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {promotion && (
                    <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                      {promotion.title}
                    </span>
                  )}
                  <div
                    className="card-img-top bg-light d-flex justify-content-center align-items-center"
                    style={{ height: '160px' }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="img-fluid"
                      style={{ maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="card-body">
                    <h6 className="card-title fw-bold">{product.name}</h6>
                    <p className="card-text text-muted mb-1">{product.description}</p>
                    {promotion?.porcentage ? (
                      <div>
                        <span className="text-muted text-decoration-line-through me-2">
                          ${Math.round(product.price / (1 - promotion.porcentage / 100)).toLocaleString()}
                        </span>
                        <span className="fw-bold text-danger">
                          ${product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <p className="mb-0 fw-bold">${product.price.toLocaleString()}</p>
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
export default Catalog
