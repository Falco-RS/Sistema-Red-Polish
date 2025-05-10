// src/pages/AddProduct/index.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'

const AddProduct = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !price || !quantity || !category || !image) {
      setError('Todos los campos son obligatorios.')
      return
    }

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('price', price)
    formData.append('quantity', quantity)
    formData.append('category', category)
    formData.append('image', image)

    try {
      // Aquí iría el fetch real
      setSuccess(true)
      setTimeout(() => navigate('/catalog'), 3000)
    } catch (err) {
      setError('Error al subir el producto.')
    }
  }

  return (
    <>
      <NavBar />
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
        <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4 text-danger fw-bold">Agregar Producto</h2>

          {error && <div className="alert alert-danger py-2 mb-4">{error}</div>}
          {success && <div className="alert alert-success py-2 mb-4">Producto agregado correctamente. Redirigiendo...</div>}

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
              <label className="text-danger fw-bold">Categoría</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Seleccione una categoría</option>
                <option value="Abrillantador">Abrillantador</option>
                <option value="Ceras">Ceras</option>
                <option value="Ventanas">Ventanas</option>
                <option value="etc">etc</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-danger fw-bold">Imagen</label>
              <input type="file" className="form-control" onChange={handleImageChange} required />
            </div>

            <button type="submit" className="btn btn-danger w-100 fw-bold">Agregar Producto</button>
          </form>

          <div className="mt-3 text-center">
            <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/catalog')}>Cancelar y volver</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddProduct