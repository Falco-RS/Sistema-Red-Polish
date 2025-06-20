import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import image from '../../assets/pulido.png'
import { useTranslation } from 'react-i18next'
import PopUpWindow from '../Pop-up_Window'

const ProductView = () => {
  const { user, token } = useAuth()
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupData, setPopupData] = useState<{ title: string; message: string; onConfirm?: () => void }>({ title: '', message: '' })
  const [quantity, setQuantity] = useState(1)
  const { id } = useParams()
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_IP_API
  const userEmail = user?.email
  const { t } = useTranslation('global')

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'
    if (user?.rol === 'Administrador') {
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

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setPopupData({ title, message, onConfirm })
    setShowPopup(true)
  }

  const handleAddToCart = async () => {
    const qty = Number(quantity)
    if (!qty || qty < 1) {
      showAlert('Cantidad inválida', 'Por favor ingrese una cantidad válida (mayor a 0).')
      return
    }

    if (!userEmail || !token || !user?.id) {
      showAlert('Inicio de sesión requerido', 'Debe iniciar sesión para añadir al carrito.')
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

      showAlert('Éxito', 'Producto añadido al carrito exitosamente')
    } catch (err) {
      console.error("❌ Error al añadir al carrito:", err)
      showAlert('Error', 'Ocurrió un error al añadir al carrito.')
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

      showAlert('Eliminado', 'Producto eliminado correctamente.', () => navigate('/catalog'))
    } catch (err) {
      console.error('❌ Error eliminando producto:', err)
      showAlert('Error', 'Hubo un error al eliminar el producto.')
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
          ⬅ {t('back')}
        </button>

        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0 text-center">
            <img
              src={product.image}
              alt={product.name}
              className="img-fluid rounded shadow"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
          </div>
          <div className="col-md-6">
            <h2 className="fw-bold text-dark mb-3">{product.name}</h2>
            <p className="text-muted mb-3">{product.description}</p>
            <h4 className="fw-bold text-dark mb-3">${product.price.toLocaleString()}</h4>

            <div className="mb-3">
              <label className="fw-bold text-dark mb-3">{t('quantity')}:</label>
              <input
                type="number"
                min="1"
                className="form-control mb-2"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />

              {user && user.rol !== 'Administrador' ? (
                <button
                  className="btn btn-primary fw-bold py-2 w-100 mb-2"
                  style={{ maxWidth: '300px' }}
                  onClick={handleAddToCart}
                >
                  {t('add_to_cart')}
                </button>
              ) : (
                <div className="alert alert-warning text-center mt-2" style={{ maxWidth: '300px' }}>
                  ⚠ {t('login_required_p')}
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-primary fw-bold py-2 w-100 mb-2"
                  style={{ maxWidth: '300px' }}
                  onClick={() => navigate(`/edit-product/${product.id}`)}
                >
                  ✏ {t('edit_p')}
                </button>
                <button
                  className="btn btn-danger fw-bold py-2 w-100"
                  style={{ maxWidth: '300px' }}
                  onClick={() => setShowConfirmModal(true)}
                >
                  🗑 {t('delete_p')}
                </button>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-5">
            <h4 className="fw-bold mb-4 text-dark">{t('related_products')}</h4>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-3">
              {relatedProducts.map((prod) => (
                <div key={prod.id} className="col">
                  <div
                    className="card shadow-sm h-100"
                    style={{ cursor: 'pointer', minHeight: '320px' }}
                    onClick={() => navigate(`/product/${prod.id}`)}
                  >
                    <div
                      className="card-img-top bg-light d-flex justify-content-center align-items-center"
                      style={{ height: '150px' }}
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="img-fluid"
                        style={{ maxHeight: '100%' }}
                      />
                    </div>
                    <div className="card-body">
                      <h6 className="card-title fw-bold">{prod.name}</h6>
                      <p className="card-text text-muted mb-1">{prod.description}</p>
                      <p className="mb-0 fw-bold">${prod.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showConfirmModal && (
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content shadow-lg">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">{t('confirm_delete_title')}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>{t('confirm_delete_message')}</p>
                  <p className="fw-bold text-danger">{t('confirm_delete_warning')}</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                    {t('cancel')}
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ventana emergente de alerta */}
        <PopUpWindow
          show={showPopup}
          title={popupData.title}
          onClose={() => {
            setShowPopup(false)
            popupData.onConfirm?.()
          }}
          onConfirm={() => {
            setShowPopup(false)
            popupData.onConfirm?.()
          }}
        >
          <p>{popupData.message}</p>
        </PopUpWindow>
      </div>
    </>
  )
}

export default ProductView
