// src/pages/ProductView/index.tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import image from '../../assets/pulido.png'

const ProductView = () => {
  const { user } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API

  useEffect(() => {
    if (user?.user?.rol === 'Administrador') {
      setIsAdmin(true)
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/products/get/${id}`)
        if (!res.ok) throw new Error('Producto no encontrado')
        const data = await res.json()
        console.log('🟢 Producto cargado:', data)
        setProduct(data)
      } catch (err) {
        console.warn('⚠️ Mostrando producto quemado por fallback.')
        // Producto quemado por defecto
        setProduct({
          id: 0,
          name: 'Cera Premium',
          description: 'Cera especial, rojo, 150ml. Ideal para dar brillo profundo y proteger la pintura.',
          price: 2500,
          image: image,
        })
      }
    }

    fetchProduct()
  }, [id, user])

  if (!product) {
    return (
      <>
        <NavBar />
        <div className="container text-center mt-5">
          <p className="text-muted">Cargando producto...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div className="container mt-5">
        <button className="btn btn-outline-dark mb-4" onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>

        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <img src={product.image} alt={product.name} className="img-fluid rounded shadow" />
          </div>
          <div className="col-md-6">
            <h2 className="fw-bold text-danger mb-3">{product.name}</h2>
            <p className="text-muted mb-3">{product.description}</p>
            <h4 className="fw-bold text-success mb-4">₡{product.price.toLocaleString()}</h4>

            <button className="btn btn-primary w-100 fw-bold mb-3">
              Añadir al carrito
            </button>

            {isAdmin && (
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-outline-warning"
                  onClick={() => navigate(`/edit-product/${product.id}`)}
                >
                  ✏ Editar Producto
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => {
                    const confirmDelete = window.confirm('¿Estás seguro de eliminar este producto?')
                    if (confirmDelete) {
                      console.log('Eliminar producto', product.id)
                    }
                  }}
                >
                  🗑 Eliminar Producto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductView
