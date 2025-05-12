import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'

const AddService = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)

  // Mock de categorías (quemado por ahora)
  const mockCategorias = [
    { id: 1, nombre: 'Lavado' },
    { id: 2, nombre: 'Pulido' },
    { id: 3, nombre: 'Desinfección' },
  ]

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !price || !duration || !categoryId || !imageUrl) {
      setError('Todos los campos son obligatorios.')
      return
    }

    const serviceData = {
      name,
      description,
      price: parseFloat(price),
      duration,
      image: imageUrl,
      categoryId: parseInt(categoryId)
    }
    console.log('Servicio a enviar:', serviceData)

    try {
      // Lógica para enviar el servicio (aún no implementado para la API)
      setSuccess(true)
      setTimeout(() => navigate('/services'), 3000)
    } catch (err) {
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

  const handleAddCategory = () => {
    if (!newCategory.trim()) return
    // Espacio reservado para agregar una nueva categoría a la API
    console.log('Nueva categoría:', newCategory)
    setNewCategory('')
    setShowNewCategory(false)
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
                  {mockCategorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
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
