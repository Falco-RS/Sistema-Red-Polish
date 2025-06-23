import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../common/AuthContext'
import { useTranslation } from 'react-i18next';
import PopUpWindow from '../Pop-up_Window'; 

const EditService = () => {
  const { user, token } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [promotionId, setPromotionId] = useState('') // NUEVO
  const [promotions, setPromotions] = useState<{ id: number; porcentage: number; title: string }[]>([]) // NUEVO
  const location = useLocation()
  const servicio = location.state?.servicio
  const apiUrl = import.meta.env.VITE_IP_API
  const navigate = useNavigate()
  const userEmail = user?.email
  const { t } = useTranslation('global');

  const [modalInfo, setModalInfo] = useState<{ show: boolean; title: string; content: string; onConfirm?: () => void }>({
    show: false,
    title: '',
    content: '',
  });

  const showAlert = (title: string, content: string, onConfirm?: () => void) => {
    setModalInfo({ show: true, title, content, onConfirm });
  };

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'

    if (!servicio) {
      setError(t('error_service_info'))
      return
    }
    console.log(servicio)
    setName(servicio.nombre)
    setDescription(servicio.descripcion)
    setDuration(servicio.duracion.toString())
    setCategoryId(servicio.id_categoria.toString())
    setImageUrl(servicio.imagen || '')
    setPromotionId(servicio.id_promocion)

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/categories/get_categories`)
        if (!res.ok) throw new Error('Error al obtener categorías')
        const data = await res.json()
        setCategories(data)
      } catch (err) {
        setError(t('error_category_fetch'))
      }
    }

    fetchCategories()
  }, [servicio])

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        // 1. Llamas al endpoint y obtienes el JSON
        const res = await fetch(`${apiUrl}/api/promotions`)
        if (!res.ok) throw new Error('Error al obtener promociones')
        const data: { id: number; porcentage: number; title: string }[] = await res.json()

        // 2. Actualizas el estado con las promociones
        setPromotions(data)

        // 3. Si el servicio viene con una promoción asignada, la buscas en el array
        if (servicio.id_promocion) {
          const promo = data.find(p => p.id === servicio.id_promocion)

          if (promo) {

            const precioDesc = typeof servicio.precio === 'string'
              ? parseFloat(servicio.precio)
              : servicio.precio

            const precioOriginal = Math.round(
              precioDesc / (1 - promo.porcentage / 100)
            )

            setOriginalPrice(precioOriginal.toString());
          }
        }
        else{
          setOriginalPrice(servicio.precio.toString());
        }

      } catch (err) {
        console.error(err)
        setError(t('error_promotions_fetch'))
      }
    }


    if (servicio) {
    fetchPromotions()
    setPromotionId(servicio.id_promocion?.toString() || '')
  }
}, [servicio])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !duration || !originalPrice || !categoryId || !imageUrl) {
      showAlert(t('error'), t('error'))
      return
    }

    const serviceData = {
      name,
      categoryId: parseInt(categoryId),
      description,
      duration,
      price: parseFloat(originalPrice),
      imageUrl: imageUrl,   
      promotionId: promotionId ? parseInt(promotionId) : null, 
    }
    try {
      const res = await fetch(`${apiUrl}/api/services/update/${servicio.id}/${userEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
         },
        body: JSON.stringify(serviceData),
      })
      if (!res.ok) throw new Error('Error en la edición')
      setSuccess(true)
      setTimeout(() => navigate('/services'), 3000)
    } catch (err) {
      setError(t('error_editing_service'))
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    try {
      const res = await fetch(`${apiUrl}/api/categories/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      })
      if (!res.ok) throw new Error('Error al crear categoría')
      const updated = await fetch(`${apiUrl}/api/categories/get_categories`).then(res => res.json())
      setCategories(updated)
      setNewCategory('')
      setShowNewCategory(false)
    } catch {
      showAlert(t('error'), 'Error al crear la categoría.')
    }
  }

  const handleDeleteService = async () => {
   if (!userEmail || !token) return

    try {
      const res = await fetch(`${apiUrl}/api/services/delete/${servicio.id}/${userEmail}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Error al eliminar el servicio')

      showAlert(t('success'), t('success_delete_service'));
      navigate('/services')
    } catch (err) {
      console.error('❌ Error eliminando el servicio:', err)
      showAlert(t('error'), t('error_delete_service'));
    }
  }

  if (!servicio) {
    return (
      <>
        <NavBar />
        <div className="container text-center mt-5">
          <p className="text-muted">{t('loading_service')}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
        <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4 text-dark  fw-bold">{t('edit_service')}o</h2>

          {error && <div className="alert alert-dark py-2 mb-4">{error}</div>}
          {success && <div className="alert alert-success py-2 mb-4">{t('success_service_edit')}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="text-dark fw-bold">{t('name')}</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-dark fw-bold">{t('description')}</label>
              <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-dark fw-bold">{t('duration')}</label>
              <input type="text" className="form-control" value={duration} onChange={(e) => setDuration(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-dark fw-bold">{t('price')}</label>
              <input type="number" className="form-control" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-dark fw-bold d-block">{t('category')}</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  style={{ flex: 1 }}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                >
                  {t('addCategory')}
                </button>
              </div>

              <div className="mb-3">
              <label className="text-dark fw-bold d-block">{t('promotion')}</label>
              <select
                className="form-select"
                value={promotionId}
                onChange={(e) => setPromotionId(e.target.value)}
              >
                <option value="">{t('no_promotion')}</option>
                {promotions.map((promo) => (
                  <option key={promo.id} value={promo.id}>
                    {promo.title}
                  </option>
                ))}
              </select>
            </div>

              {showNewCategory && (
                <div className="mt-2 d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nueva categoría"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={handleAddCategory}
                  >
                    {t('save')}
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="text-dark fw-bold">{t('imageUrl')}</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 fw-bold">{t('save_changes')}</button>
          </form>

          <div className="mt-3 text-center d-flex justify-content-center gap-3">
            <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/services')}>{t('cancel_add')}</button>
            <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteService}>{t('delete_service')}</button>
        </div>
        </div>
        {modalInfo.show && (
          <PopUpWindow
            show={modalInfo.show}
            title={modalInfo.title}
            onClose={() => setModalInfo({ ...modalInfo, show: false })}
            onConfirm={() => {
              setModalInfo({ ...modalInfo, show: false });
              if (modalInfo.onConfirm) modalInfo.onConfirm();
            }}
          >
            <p>{modalInfo.content}</p>
          </PopUpWindow>
        )}
      </div>
    </>
  )
}

export default EditService
