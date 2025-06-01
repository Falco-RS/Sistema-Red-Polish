import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import MostrarCitas from '../../components/MostrarCitas'
import Cancelacion from '../../components/Cancelaciones'

const UserManagement = () => {
  const navigate = useNavigate()
  const { user, token, login } = useAuth()
  const apiUrl = import.meta.env.VITE_IP_API;

  const [firstName, setFirstName] = useState(user?.name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState<'info' | 'citas' | 'gestion' | 'promos' | 'ventas' | 'cancelar'>('info')



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const userEmail = user?.email

    if (!firstName.trim() || !lastName.trim()) {
      setError('Por favor, complete los campos que desea cambiar en su perfil')
      setSuccess(false)
      return
    }

    const updatedUser = {
      name: firstName,
      last_name: lastName,
      password: password || user?.password,
    }

    const fullUser = {
      id: user?.id,
      name: firstName,
      last_name: lastName,
      email: userEmail,
      password: password || user?.password,
      rol: user?.rol,
    }

    try {
      const response = await fetch(`${apiUrl}/api/users/update/${userEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Error al actualizar los datos.')
        setSuccess(false)
        return
      }
      login(fullUser, token!)



      setError('')
      setSuccess(true)
    } catch (err) {
      console.error('❌ Error al hacer la petición:', err)
      setError('Error de conexión con el servidor.')
      setSuccess(false)
    }
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, navigate])

  const [promotions, setPromotions] = useState<any[]>([])

useEffect(() => {
  const fetchPromotions = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/promotions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error(`❌ Error ${res.status}:`, errorText)
        return
      }

      const data = await res.json()
      console.log('Promotions fetched:', data)
      setPromotions(data)
    } catch (error) {
      console.error('❌ Error al obtener promociones:', error)
    }
  }

  fetchPromotions()
}, [apiUrl, token])


  const [salesHistory, setSalesHistory] = useState([
  {
    id: 1,
    client: 'Pedro',
    date: '11/03/2025',
    products: [{ name: 'Cera', quantity: 2 }],
    payment: 'T.Bancaria',
    status: 'Venta Exitosa',
    total: 14500,
  },
  {
    id: 2,
    client: 'Lucas',
    date: '11/03/2025',
    products: [{ name: 'Cera', quantity: 1 }],
    payment: 'Efectivo',
    status: 'Venta Anulada',
    total: 0,
  }
])

  const [newPromo, setNewPromo] = useState({ name: '', start: '', end: '', percentage: '' })
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null)
  const [showAssignPanel, setShowAssignPanel] = useState(false)
  const [assigningPromoId, setAssigningPromoId] = useState<number | null>(null)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const userToken = user?.token

  const handlePromoSubmit = async () => {
  if (!newPromo.name || !newPromo.start || !newPromo.end || !newPromo.percentage) {
    alert('Por favor, completa todos los campos.')
    return
  }

  const promoPayload = {
    title: newPromo.name,
    description: "Descuento Nuevo",
    percentage: parseInt(newPromo.percentage),
    start_date: newPromo.start,
    end_date: newPromo.end
  }

  const method = editingPromoId ? 'PUT' : 'POST'
  const url = editingPromoId
    ? `http://localhost:8080/api/promotions/${editingPromoId}`
    : `http://localhost:8080/api/promotions`

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(promoPayload)
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ Error ${res.status}:`, text)
      alert(`❌ Error ${res.status}: ${text}`)
      return
    }

    alert('✅ Promoción guardada correctamente.')
    setNewPromo({ name: '', start: '', end: '', percentage: '' })
    setEditingPromoId(null)

    await refreshPromotions()
  } catch (error) {
    console.error('❌ Error al guardar promoción:', error)
    alert('Error de conexión con el servidor.')
  }
}

  const togglePromoActive = (id: number) => {
    setPromotions(promotions.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  const deletePromo = (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta promoción?')) {
      setPromotions(promotions.filter(p => p.id !== id))
    }
  }

  const assignPromoToProduct = async (promoId: number) => {
    setAssigningPromoId(promoId)
    setShowAssignPanel(true)
    try {
      const res = await fetch(`${apiUrl}/api/products/get_all`)
      const data = await res.json()
      setAvailableProducts(data.filter((p: any) => p.stock > 0))
    } catch (err) {
      console.error('❌ Error al obtener productos:', err)
    }
  }

  const confirmAssignProducts = () => {
    alert(`Promoción asignada a productos: ${selectedProducts.join(', ')}`)
    setShowAssignPanel(false)
    setSelectedProducts([])
    setAssigningPromoId(null)
  }

  const toggleSelectProduct = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    )
  }

  const editPromo = async (promoId: number) => {
  try {
    const res = await fetch(`http://localhost:8080/api/promotions/${promoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`❌ Error al obtener promoción ${promoId}:`, errorText)
      alert(`Error al obtener datos de la promoción.`)
      return
    }

    const promo = await res.json()
    setNewPromo({
      name: promo.title,
      start: promo.start_date,
      end: promo.end_date,
      percentage: promo.percentage
    })
    setEditingPromoId(promoId)
  } catch (err) {
    console.error('❌ Error al cargar promoción para edición:', err)
    alert('Error al cargar la promoción.')
  }
}

const refreshPromotions = async () => {
  try {
    const res = await fetch(`http://localhost:8080/api/promotions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ Error al refrescar promociones:`, text)
      return
    }

    const data = await res.json()
    setPromotions(data)
  } catch (error) {
    console.error('❌ Error al refrescar promociones:', error)
  }
}


  return (
  <>
    <NavBar />
    <div className="container-fluid d-flex" style={{ minHeight: '100vh' }}>
      <div className="bg-danger text-white p-4" style={{ width: '250px', minHeight: '100%' }}>
        <h4 className="fw-bold mb-4">Mi perfil</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button className={`btn btn-sm w-100 text-start ${activeSection === 'info' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
              onClick={() => setActiveSection('info')}>Información</button>
          </li>
          {user?.rol === 'Administrador'
        ? <li className="nav-item">
            <button className={`btn btn-sm w-100 text-start ${activeSection === 'ventas' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
              onClick={() => setActiveSection('citas')}>Citas</button>
          </li>
        : <li className="nav-item">
            <button className={`btn btn-sm w-100 text-start ${activeSection === 'ventas' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
              onClick={() => setActiveSection('citas')}>Mis citas</button>
          </li>}
          {user?.rol === 'Administrador'
        ? <li className="nav-item">
            <button className={`btn btn-sm w-100 text-start ${activeSection === 'cancelar' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
              onClick={() => setActiveSection('cancelar')}>Cancelaciones</button>
          </li>
        : <li className="nav-item">
            <button className={`btn btn-sm w-100 text-start ${activeSection === 'cancelar' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
              onClick={() => setActiveSection('cancelar')}>Mis cancelaciones</button>
          </li>}
          <li className="nav-item">
            <button className={`btn btn-sm w-100 text-start ${activeSection === 'gestion' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
              onClick={() => setActiveSection('gestion')}>Gestión de usuario</button>
          </li>
          {user?.rol === 'Administrador' && (
            <li className="nav-item">
              <button className={`btn btn-sm w-100 text-start ${activeSection === 'promos' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
                onClick={() => setActiveSection('promos')}>Promociones</button>
            </li>
          )}
          {user?.rol === 'Administrador'
        ? <li className="nav-item">
            <button className={`btn btn-sm w-100 text-start ${activeSection === 'ventas' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
              onClick={() => setActiveSection('ventas')}>Historial Compras</button>
          </li>
        : <li className="nav-item">
            <button className={`btn btn-sm w-100 text-start ${activeSection === 'ventas' ? 'btn-light text-danger fw-bold' : 'btn-outline-light text-white'}`}
              onClick={() => setActiveSection('ventas')}>Mi Historial de Compras</button>
          </li>}
        </ul>
      </div>

      <div className="flex-grow-1 p-5">
        {activeSection === 'info' && (
          <>
            <h2 className="text-danger fw-bold mb-4">Información del Usuario</h2>
            <div className="mb-3"><strong>Nombre:</strong> {user?.name}</div>
            <div className="mb-3"><strong>Apellidos:</strong> {user?.last_name}</div>
            <div className="mb-3"><strong>Correo:</strong> {user?.email}</div>
          </>
        )}

        {activeSection === 'citas' && <MostrarCitas />}
        {activeSection === 'cancelar' && <Cancelacion />}

        {activeSection === 'gestion' && (
          <div className="bg-light p-4 rounded-4 shadow" style={{ border: '2px solid #dc3545', maxWidth: '600px' }}>
            <h2 className="text-danger fw-bold mb-4">Gestión de Usuario</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">✅ ¡Datos actualizados! Redirigiendo al inicio...</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-dark fw-semibold">Nombre</label>
                <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label text-dark fw-semibold">Apellidos</label>
                <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="form-label text-dark fw-semibold">Nueva contraseña (opcional)</label>
                <div className="input-group">
                  <input type={showPassword ? 'text' : 'password'} className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Cree una nueva contraseña" />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-danger w-100 fw-bold">Guardar Cambios</button>
            </form>
          </div>
        )}

        {activeSection === 'promos' && (
          <div>
            <h2 className="text-danger fw-bold mb-4">Gestión de Promociones</h2>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Descuento</th>
                    <th>Activa</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map((promo) => (
                    <tr key={promo.id}>
                      <td>{promo.title}</td>
                      <td>{promo.start_date}</td>
                      <td>{promo.end_date}</td>
                      <td>{promo.percentage !== undefined && promo.percentage !== null ? `${promo.percentage}%` : '—'}</td>
                      <td className="text-center">
                      <span
                        className={`d-inline-block rounded-circle`}
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: promo.active ? 'green' : 'red',
                        }}
                      />
                    </td>
                      <td className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => {
                          setEditingPromoId(promo.id)
                          setNewPromo({ ...promo, percentage: promo.percentage.toString() })
                        }}>Editar</button>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => togglePromoActive(promo.id)}>
                          {promo.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => deletePromo(promo.id)}>
                          Eliminar
                        </button>
                        <button className="btn btn-sm btn-outline-dark" onClick={() => assignPromoToProduct(promo.id)}>Asignar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showAssignPanel && (
              <div className="bg-light p-4 border mt-4 rounded-3 shadow-sm">
                <h5 className="fw-bold text-danger mb-3">Asignar productos a promoción</h5>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                  {availableProducts.map((prod) => (
                    <div key={prod.id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={prod.id}
                        id={`product-${prod.id}`}
                        checked={selectedProducts.includes(prod.id)}
                        onChange={() => toggleSelectProduct(prod.id)}
                      />
                      <label className="form-check-label text-dark" htmlFor={`product-${prod.id}`}>
                        {prod.name} - ₡{prod.price.toLocaleString()}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button className="btn btn-outline-secondary" onClick={() => setShowAssignPanel(false)}>Cancelar</button>
                  <button className="btn btn-danger fw-bold" onClick={confirmAssignProducts}>Asignar</button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h5>{editingPromoId ? 'Editar Promoción' : 'Nueva Promoción'}</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="Nombre"
                    value={newPromo.name} onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <input type="date" className="form-control" placeholder="Inicio"
                    value={newPromo.start} onChange={(e) => setNewPromo({ ...newPromo, start: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <input type="date" className="form-control" placeholder="Fin"
                    value={newPromo.end} onChange={(e) => setNewPromo({ ...newPromo, end: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <input type="number" className="form-control" placeholder="%"
                    value={newPromo.percentage} onChange={(e) => setNewPromo({ ...newPromo, percentage: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <button className="btn btn-danger w-100 fw-bold" onClick={handlePromoSubmit}>
                    {editingPromoId ? 'Guardar' : 'Crear'}
                  </button>
                </div>
                {editingPromoId && (
                <div className="col-md-2">
                  <button
                    className="btn btn-outline-danger w-100"
                    onClick={() => setShowAssignPanel(true)}
                  >
                    Asignar Productos
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        )}
        {activeSection === 'ventas' && (
        <div>
          <h2 className="text-danger fw-bold mb-4">
            {user?.rol === 'Administrador' ? 'Historial de Compras' : 'Mi Historial de Compras'}
          </h2>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre del Cliente</th>
                  <th>Fecha Venta</th>
                  <th>Productos</th>
                  <th>Cantidad</th>
                  <th>Forma de Pago</th>
                  <th>Estado Venta</th>
                  <th>Total Venta</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory
                  .filter(sale => user?.rol === 'Administrador' || sale.client === user?.name)
                  .map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.client}</td>
                      <td>{sale.date}</td>
                      <td>
                        {sale.products.map((p, i) => (
                          <div key={i}>{p.name}</div>
                        ))}
                      </td>
                      <td>
                        {sale.products.map((p, i) => (
                          <div key={i}>{p.quantity}</div>
                        ))}
                      </td>
                      <td>{sale.payment}</td>
                      <td>
                        <span className={`badge ${sale.status === 'Venta Exitosa' ? 'bg-success' : 'bg-danger'}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td>₡{sale.total.toLocaleString()}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  </>
)
}
export default UserManagement


