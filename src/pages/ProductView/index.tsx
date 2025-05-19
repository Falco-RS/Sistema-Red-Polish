import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import image from '../../assets/pulido.png'

const ProductView = () => {
  const { user, token } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { id } = useParams()
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API
  const userEmail = user?.email

  useEffect(() => {
    if (user?.user?.rol === 'Administrador') {
      setIsAdmin(true)
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/products/get/${id}`)
        if (!res.ok) throw new Error('Producto no encontrado')
        const data = await res.json()
        setProduct(data)
      } catch {
        setProduct({
          id: 0,
          name: 'Cera Premium',
          description: 'Cera especial, rojo, 150ml. Ideal para dar brillo profundo y proteger la pintura.',
          price: 2500,
          image: image,
          categoryId: 1,
        })
      }
    }

    fetchProduct()
  }, [id, user])

  const handleAddToCart = async () => {
    const qty = Number(quantity)
    if (!qty || qty < 1) {
      alert("Por favor ingrese una cantidad válida (mayor a 0).")
      return
    }

    if (!userEmail || !token || !user?.id) {
      alert("Debe iniciar sesión para añadir al carrito.")
      return
    }

    try {
      const res = await fetch(`${apiUrl}/api/cart/add/${userEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id,
          quantity: qty,
        }),
      })

      if (!res.ok) throw new Error('Error al añadir al carrito')

      alert("Producto añadido al carrito exitosamente")
    } catch (err) {
      console.error("❌ Error al añadir al carrito:", err)
      alert("Ocurrió un error al añadir al carrito.")
    }
  }

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.categoryId) return

      try {
        const res = await fetch(`${apiUrl}/api/products/get_all`)
        const data = await res.json()
        const related = data.filter((p: any) => p.categoryId === product.categoryId && p.id !== product.id)
        setRelatedProducts(related)
      } catch (err) {
        console.error('❌ Error al obtener productos relacionados:', err)
      }
    }

    fetchRelatedProducts()
  }, [product])

  const handleDelete = async () => {
    if (!userEmail || !token) return

    try {
      const res = await fetch(`${apiUrl}/api/products/delete/${product.id}/${userEmail}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Error al eliminar producto')

      alert('Producto eliminado correctamente.')
      navigate('/catalog')
    } catch (err) {
      console.error('❌ Error eliminando producto:', err)
      alert('Hubo un error al eliminar el producto.')
    }
  }

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

            <div className="mb-3">
              <label className="form-label fw-bold">Cantidad:</label>
              <input
                type="number"
                min="1"
                className="form-control mb-2"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <button className="btn btn-primary w-100 fw-bold" onClick={handleAddToCart}>
                Añadir al carrito
              </button>
            </div>


            {isAdmin && (
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-primary w-100 fw-bold mb-3"
                  onClick={() => navigate(`/edit-product/${product.id}`)}
                >
                  ✏ Editar Producto
                </button>
                <button
                  className="btn btn-danger w-100 fw-bold"
                  onClick={() => setShowConfirmModal(true)}
                >
                  🗑 Eliminar Producto
                </button>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-5">
            <h4 className="fw-bold mb-4 text-danger">Productos Relacionados</h4>
            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
              {relatedProducts.map((prod) => (
                <div key={prod.id} className="col">
                  <div
                    className="card shadow-sm h-100"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${prod.id}`)}
                  >
                    <div className="card-img-top bg-light d-flex justify-content-center align-items-center" style={{ height: '180px' }}>
                      <img src={prod.image} alt={prod.name} className="img-fluid" style={{ maxHeight: '100%' }} />
                    </div>
                    <div className="card-body">
                      <h6 className="card-title fw-bold">{prod.name}</h6>
                      <p className="text-muted mb-1">{prod.description}</p>
                      <p className="mb-0 fw-bold">₡{prod.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔴 Modal de confirmación */}
      {showConfirmModal && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar este producto?</p>
                <p className="fw-bold text-danger">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductView
