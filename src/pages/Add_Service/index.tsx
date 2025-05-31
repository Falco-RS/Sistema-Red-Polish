import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'

const AddService = () => {
  const { user, token } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const apiUrl = import.meta.env.VITE_IP_API;
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
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
  }, [])

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !price || !duration || !categoryId || !imageUrl) {
      setError('Todos los campos son obligatorios.')
      return
    }

    const serviceData = {
      name,
      categoryId: parseInt(categoryId),
      description,
      duration,
      price: parseFloat(price),
      imageUrl: imageUrl
    }

    try {
      const res = await fetch(`${apiUrl}/api/services/create/${user?.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData)
      })

      if (!res.ok) throw new Error('Error en la petición')

      setSuccess(true)
      setTimeout(() => navigate('/services'), 3000)
    } catch (err) {
      console.error(err)
      setError('Error al subir el servicio.')
    }
  }


  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value)) {
      setPrice(value)
    }
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setDuration(value)
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

  return (
    <>
      <NavBar />
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
        <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4 text-danger fw-bold">Agregar Servicio</h2>

          {error && <div className="alert alert-danger py-2 mb-4">{error}</div>}
          {success && <div className="alert alert-success py-2 mb-4">Servicio agregado correctamente. Redirigiendo...</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="text-danger fw-bold">Nombre</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-danger fw-bold">Descripción</label>
              <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-danger fw-bold">Precio</label>
              <input type="text" className="form-control" value={price} onChange={handlePriceChange} required />
            </div>

            <div className="mb-3">
              <label className="text-danger fw-bold">Duración (minutos)</label>
              <input type="text" className="form-control" value={duration} onChange={handleDurationChange} required />
            </div>

            <div className="mb-3">
              <label className="text-danger fw-bold d-block">Categoría</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                >
                  Agregar categoría
                </button>
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
                    className="btn btn-outline-danger"
                    onClick={handleAddCategory}
                  >
                    Guardar
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="text-danger fw-bold">URL de Imagen</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-danger w-100 fw-bold">Agregar Servicio</button>
          </form>

          <div className="mt-3 text-center">
            <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/services')}>Cancelar y volver</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddService
