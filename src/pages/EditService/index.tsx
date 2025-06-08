import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../common/AuthContext'

const EditService = () => {
  const { user, token } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [promotionId, setPromotionId] = useState('') // NUEVO
  const [promotions, setPromotions] = useState<{ id: number, title: string }[]>([]) // NUEVO
  const location = useLocation()
  const servicio = location.state?.servicio
  const apiUrl = import.meta.env.VITE_IP_API
  const navigate = useNavigate()
  const userEmail = user?.email

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'

    if (!servicio) {
      setError('No se encontró información del servicio.')
      return
    }
    console.log(servicio)
    setName(servicio.nombre)
    setDescription(servicio.descripcion)
    setDuration(servicio.duracion.toString())
    setPrice(servicio.precio.toString())
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
        setError('No se pudieron cargar las categorías.')
      }
    }

    fetchCategories()
  }, [servicio])

  useEffect(() => {
  const fetchPromotions = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/promotions`)
      if (!res.ok) throw new Error('Error al obtener promociones')
      const data = await res.json()
      setPromotions(data)
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar las promociones.')
    }
  }

  if (servicio) {
    fetchPromotions()
    setPromotionId(servicio.id_promocion?.toString() || '')
  }
}, [servicio])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !duration || !price || !categoryId || !imageUrl) {
      setError('Todos los campos son obligatorios.')
      return
    }

    const serviceData = {
      name,
      categoryId: parseInt(categoryId),
      description,
      duration,
      price: parseFloat(price),
      imageUrl: imageUrl,   
      promotionId: promotionId ? parseInt(promotionId) : null, 
    }
    console.log('🔧 Editando servicio:', serviceData)

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
      setError('Error al editar el servicio.')
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
      setError('Error al crear la categoría.')
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

      alert('Servicio eliminado correctamente.')
      navigate('/services')
    } catch (err) {
      console.error('❌ Error eliminando el servicio:', err)
      alert('Hubo un error al eliminar el servicio.')
    }
  }

  if (!servicio) {
    return (
      <>
        <NavBar />
        <div className="container text-center mt-5">
          <p className="text-muted">Cargando servicio...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar />
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
        <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4 text-dark  fw-bold">Editar Servicio</h2>

          {error && <div className="alert alert-dark py-2 mb-4">{error}</div>}
          {success && <div className="alert alert-success py-2 mb-4">Servicio editado correctamente. Redirigiendo...</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="text-dark fw-bold">Nombre</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-dark fw-bold">Descripción</label>
              <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-dark fw-bold">Duración</label>
              <input type="text" className="form-control" value={duration} onChange={(e) => setDuration(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-dark fw-bold">Precio</label>
              <input type="number" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-dark fw-bold d-block">Categoría</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  style={{ flex: 1 }}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                >
                  Agregar categoría
                </button>
              </div>

              <div className="mb-3">
              <label className="text-dark fw-bold d-block">Asignar promoción</label>
              <select
                className="form-select"
                value={promotionId}
                onChange={(e) => setPromotionId(e.target.value)}
              >
                <option value="">Sin promoción</option>
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
                    Guardar
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="text-dark fw-bold">URL de Imagen</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 fw-bold">Guardar Cambios</button>
          </form>

          <div className="mt-3 text-center d-flex justify-content-center gap-3">
            <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/services')}>Cancelar y volver</button>
            <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteService}>Eliminar Servicio</button>
        </div>
        </div>
      </div>
    </>
  )
}

export default EditService
