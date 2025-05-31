import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'

const EditProduct = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const { user, token, login } = useAuth()
  

  const apiUrl = import.meta.env.VITE_IP_API
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    // Obtener el producto actual
    fetch(`${apiUrl}/api/products/get/${id}`)
      .then(res => res.json())
      .then(data => {
        setName(data.name)
        setDescription(data.description)
        setPrice(data.price.toString())
        setQuantity(data.stock.toString())
        setCategoryId(data.categoryId.toString())
        setImageUrl(data.image)
      })
      .catch(() => setError('Error al cargar el producto.'))

    // Obtener categorías
    fetch(`${apiUrl}/api/categories/get_categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]))
  }, [apiUrl, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !price || !quantity || !categoryId || !imageUrl) {
      setError('Todos los campos son obligatorios.')
      return
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(quantity),
      image: imageUrl,
      categoryId: parseInt(categoryId)
    }
    console.log('🔧 Editando producto:', productData)

    const userEmail = user?.email
    const userToken = token

    try {
      const res = await fetch(`${apiUrl}/api/products/update/${id}/${userEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
         },
        body: JSON.stringify(productData)
      })
      if (!res.ok) throw new Error('Error en la edición')
      setSuccess(true)
      setTimeout(() => navigate('/catalog'), 3000)
    } catch (err) {
      setError('Error al editar el producto.')
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    try {
      await fetch(`${apiUrl}/api/categories/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      })
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
          <h2 className="text-center mb-4 text-danger fw-bold">Editar Producto</h2>

          {error && <div className="alert alert-danger py-2 mb-4">{error}</div>}
          {success && <div className="alert alert-success py-2 mb-4">Producto editado correctamente. Redirigiendo...</div>}

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
              <input type="number" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-danger fw-bold">Cantidad</label>
              <input type="number" className="form-control" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>

            <div className="mb-3">
              <label className="text-danger fw-bold d-block">Categoría</label>
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

            <button type="submit" className="btn btn-danger w-100 fw-bold">Guardar Cambios</button>
          </form>

          <div className="mt-3 text-center">
            <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/catalog')}>Cancelar y volver</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditProduct
