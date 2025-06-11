import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('global');

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
      setError(t('error'))
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
      const res = await fetch(`${apiUrl}/api/services/add/${user?.email}`, {
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
      setError(t('addServiceError'))
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
      setError(t('categoryError'))
    }
  }

  return (
    <>
      <NavBar />
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
        <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4 text-dark fw-bold">{t('addServiceTitle')}</h2>

          {error && <div className="alert alert-primary py-2 mb-4">{error}</div>}
          {success && <div className="alert alert-success py-2 mb-4">{t('addServiceSuccess')}</div>}

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
              <label className="text-dark fw-bold">{t('price')}</label>
              <input type="text" className="form-control" value={price} onChange={handlePriceChange} required />
            </div>

            <div className="mb-3">
              <label className="text-dark fw-bold">{t('duration')} ({t('minutes')})</label>
              <input type="text" className="form-control" value={duration} onChange={handleDurationChange} required />
            </div>

            <div className="mb-3">
              <label className="text-dark fw-bold d-block">{t('category')}</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map((cat: any) => (
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
                    className="btn btn-outline-primary"
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

            <button type="submit" className="btn btn-primary w-100 fw-bold">{t('addServiceTitle')}</button>
          </form>

          <div className="mt-3 text-center">
            <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/services')}>{t('cancel_add')}</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddService
