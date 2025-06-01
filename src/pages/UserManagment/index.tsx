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
      const res = await fetch(`${apiUrl}/api/promotions`, {
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

  const [newPromo, setNewPromo] = useState<{
    title: string;
    start_date: string;
    end_date: string;
    porcentage: number | '';
  }>({
    title: '',
    start_date: '',
    end_date: '',
    porcentage: '',
  });
  const [editingPromoId, setEditingPromoId] = useState<number | null>(null)
  const [showAssignPanel, setShowAssignPanel] = useState(false)
  const [assigningPromoId, setAssigningPromoId] = useState<number | null>(null)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const userToken = user?.token

  const handlePromoSubmit = async () => {
  if (!newPromo.title || !newPromo.start_date || !newPromo.end_date || !newPromo.porcentage) {
    alert('Por favor, completa todos los campos.')
    return
  }

  const promoPayload = {
    title: newPromo.title,
    description: "Descuento Nuevo",
    porcentage: newPromo.porcentage,
    start_date: newPromo.start_date,
    end_date: newPromo.end_date
  }

  const method = editingPromoId ? 'PUT' : 'POST'
  const url = editingPromoId
    ? `${apiUrl}/api/promotions/${editingPromoId}`
    : `${apiUrl}/api/promotions`

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
    setNewPromo({ title: '', start_date: '', end_date: '', porcentage: '' })
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

  const deletePromo = async (id: number) => {
  try {
    const response = await fetch(`${apiUrl}/api/promotions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log('Promoción eliminada correctamente');
      refreshPromotions(); 
    } else {
      console.error('Error al eliminar la promoción');
    }
  } catch (error) {
    console.error('Error en la petición DELETE:', error);
  }
};

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
    const res = await fetch(`${apiUrl}/api/promotions/${promoId}`, {
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
      title: promo.title,
      start_date: promo.start_date,
      end_date: promo.end_date,
      porcentage: promo.porcentage
    })
    setEditingPromoId(promoId)
  } catch (err) {
    console.error('❌ Error al cargar promoción para edición:', err)
    alert('Error al cargar la promoción.')
  }
}

const refreshPromotions = async () => {
  try {
    const res = await fetch(`${apiUrl}/api/promotions`, {
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
                      <td>{promo.start_date.split('T')[0]}</td>
                      <td>{promo.end_date.split('T')[0]}</td>
                      <td>{promo.porcentage !== undefined && promo.porcentage !== null ? `${promo.porcentage}%` : '—'}</td>
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
                          setNewPromo({ ...promo})
                        }}>Editar</button>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => togglePromoActive(promo.id)}>
                          {promo.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deletePromo(promo.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <h5>{editingPromoId ? 'Editar Promoción' : 'Nueva Promoción'}</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <input type="text" className="form-control" placeholder="Nombre"
                    value={newPromo.title} onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <input type="date" className="form-control" placeholder="Inicio"
                    value={newPromo.start_date} onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <input type="date" className="form-control" placeholder="Fin"
                    value={newPromo.end_date} onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <input 
                    type="number"
                    className="form-control"
                    placeholder="%"
                    value={newPromo.porcentage}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, porcentage: parseFloat(e.target.value) })
                    }
                  />
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


