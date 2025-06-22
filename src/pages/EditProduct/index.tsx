import { useEffect, useState } from 'react' 
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import { useTranslation } from 'react-i18next';

const EditProduct = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [promotionId, setPromotionId] = useState('') // NUEVO
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
  const [promotions, setPromotions] = useState<{ id: number, title: string }[]>([]) // NUEVO
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const { user, token } = useAuth()
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const { t } = useTranslation('global');

  const apiUrl = import.meta.env.VITE_IP_API
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'

    fetch(`${apiUrl}/api/products/get/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log(data)
        setName(data.name)
        setDescription(data.description)
        setOriginalPrice(data.price);
        setPrice(data.price.toString())
        setQuantity(data.stock.toString())
        setCategoryId(data.categoryId.toString())
        setImageUrl(data.image)
        if (data.promotion?.id) {
        setPromotionId(data.promotion.id.toString())
      }
      })
      .catch(() => setError(t('error_loading_product')))

    // Obtener categorías
    fetch(`${apiUrl}/api/categories/get_categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]))

    // Obtener promociones
    const fetchPromotions = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/promotions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
        const data = await res.json()
        setPromotions(data)
      } catch {
        setPromotions([])
      }
    }
    fetchPromotions()
  }, [apiUrl, id, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !price || !quantity || !categoryId || !imageUrl) {
      setError(t('error'))
      return
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(quantity),
      image: imageUrl,
      categoryId: parseInt(categoryId),
      promotionId: promotionId ? parseInt(promotionId) : null
    }

    const userEmail = user?.email
    console.log(productData)

    try {
      const res = await fetch(`${apiUrl}/api/products/update/${id}/${userEmail}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData)
      })
      if (!res.ok) throw new Error('Error en la edición')
      setSuccess(true)
      setTimeout(() => navigate('/catalog'), 3000)
    } catch (err) {
      setError(t('error_editing'))
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
      setError(t('categoryError'))
    }
  }

  return (
  <>
    <NavBar />
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
      <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4 text-dark fw-bold">{t('edit_product')}</h2>

        {error && <div className="alert alert-danger py-2 mb-4">{error}</div>}
        {success && <div className="alert alert-success py-2 mb-4">{t('success_edit')}</div>}

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
            <input
              type="number"
              className="form-control"
              placeholder={originalPrice !== null ? originalPrice.toString() : ''}
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>


          <div className="mb-3">
            <label className="text-dark fw-bold">{t('quantity')}</label>
            <input type="number" className="form-control" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                   required/>
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

          <div className="mb-3">
            <label className="text-dark fw-bold d-block">{t('promotion')}</label>
            <select
              className="form-select"
              value={promotionId}
              onChange={(e) => setPromotionId(e.target.value)}
            >
              <option value="">{t('no_promotion')}</option>
              {promotions.map((promo) => (
                <option key={promo.id} value={promo.id.toString()}>{promo.title}</option>
              ))}
            </select>
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

        <div className="mt-3 text-center">
          <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/catalog')}>{t('cancel_add')}</button>
        </div>
      </div>
    </div>
  </>
)
}

export default EditProduct

