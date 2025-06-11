import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import NavBar from '../../common/NavBar'
import { useAuth } from '../../common/AuthContext'
import MostrarCitas from '../../components/MostrarCitas'
import { useTranslation } from 'react-i18next';

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
  const [activeSection, setActiveSection] = useState<'info' | 'citas' | 'gestion' | 'promos' | 'ventas' | 'promosActivas' | 'notificaciones'>('info');

  const { setLanguage } = useAuth();

  const { t, i18n } = useTranslation('global');

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
    document.body.style.backgroundColor = '#ffffff'

    if (success) {
      const timer = setTimeout(() => {
        navigate('/')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, navigate])

  const [promotions, setPromotions] = useState<any[]>([])
  const [tieneNotificacion, setTieneNotificacion] = useState(false);


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
      if (user?.rol !== 'Administrador') {
        const notificacionesGuardadas = JSON.parse(localStorage.getItem(`notificaciones-${user.email}`) || '[]');
        const nuevasNotificaciones = [];

        const hoy = new Date();

        for (const promo of data) {
          const inicio = new Date(promo.start_date);
          const fin = new Date(promo.end_date);
          const yaExiste = notificacionesGuardadas.some((n: any) => n.id === promo.id);

          if (hoy >= inicio && hoy <= fin && !yaExiste) {
            nuevasNotificaciones.push({
              id: promo.id,
              mensaje: `🎉 ¡Aprovecha la nueva promoción "${promo.title}"! Vigente desde el ${promo.start_date.split('T')[0]} hasta el ${promo.end_date.split('T')[0]}. ¡No te la pierdas!`
            });
          }
        }

        if (nuevasNotificaciones.length > 0) {
          const todas = [...notificacionesGuardadas, ...nuevasNotificaciones];
          localStorage.setItem(`notificaciones-${user.email}`, JSON.stringify(todas));
          setTieneNotificacion(true);
        }
      }

    } catch (error) {
      console.error('❌ Error al obtener promociones:', error)
    }
  }

  fetchPromotions()
}, [apiUrl, token])

  const promocionesActivas = promotions.filter(promo => {
    const hoy = new Date()
    const inicio = new Date(promo.start_date)
    const fin = new Date(promo.end_date)

    return hoy >= inicio && hoy <= fin
  })
  

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
  const [salesHistory, setSalesHistory] = useState<any[]>([]);

  useEffect(() => {
  const fetchSalesHistory = async () => {
    if (!user || !token) return;

    const endpoint = user.rol === 'Administrador'
      ? `${apiUrl}/api/compras/admin`
      : `${apiUrl}/api/compras/history/${user.email}`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error al obtener historial de compras: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('🧾 Compras recibidas:', data);

      const mappedData = data.map((compra: any, index: number) => ({
        id: compra.idCompra || index,
        client: compra.cliente?.name || 'Desconocido',
        date: compra.fechaCompra || 'Fecha no disponible',
        description: compra.descripcion || '—',
        status: compra.estadoPago || 'Sin estado',
        total: compra.precioCompra || 0
      }));

      setSalesHistory(mappedData);
      console.log(salesHistory);
      console.log(mappedData);
    } catch (error) {
      console.error('❌ Error al cargar historial de compras:', error);
    }
  };

  fetchSalesHistory();
  console.log(salesHistory);
}, [user, token, apiUrl]);

const confirmarCompra = async (idCompra: number) => {
  if (!user?.email || !token) return;

  const url = `${apiUrl}/api/payments/sinpe/confirm/compra/${idCompra}`;

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error al confirmar la compra:', errorText);
      alert('No se pudo confirmar la compra.');
      return;
    }

    alert('✅ Compra confirmada exitosamente.');
    const fetchSalesHistory = async () => {
      const endpoint = user.rol === 'Administrador'
        ? `${apiUrl}/api/compras/admin`
        : `${apiUrl}/api/compras/history/${user.email}`;
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      const mappedData = data.map((compra: any, index: number) => ({
        id: compra.idCompra || index,
        client: compra.cliente?.name || 'Desconocido',
        date: compra.fechaCompra || 'Fecha no disponible',
        description: compra.descripcion || '—',
        status: compra.estadoPago || 'Sin estado',
        total: compra.precioCompra || 0
      }));
      setSalesHistory(mappedData);
    };

    fetchSalesHistory();

  } catch (error) {
    console.error('❌ Error al hacer PUT:', error);
    alert('Error de conexión.');
  }
};

   return (
    <>
      <NavBar />
      <div className="container-fluid d-flex" style={{ minHeight: '100vh' }}>
        <div className="p-4" style={{ width: '250px', minHeight: '100%', backgroundColor: '#f1f1f1' }}>
          <h4 className="fw-bold mb-4 text-dark">Mi perfil</h4>
            <li className="nav-item mb-2">
              <button className={`btn btn-sm w-100 text-start ${activeSection === 'info' ? 'btn-light text-dark fw-bold' : 'btn-outline-secondary text-dark'}`} onClick={() => setActiveSection('info')}>Información</button>
            </li>
            <li className="nav-item mb-2">
              <button className={`btn btn-sm w-100 text-start ${activeSection === 'citas' ? 'btn-light text-dark fw-bold' : 'btn-outline-secondary text-dark'}`} onClick={() => setActiveSection('citas')}>{user?.rol === 'Administrador' ? 'Citas' : 'Mis citas'}</button>
            </li>
            <li className="nav-item mb-2">
              <button className={`btn btn-sm w-100 text-start ${activeSection === 'gestion' ? 'btn-light text-dark fw-bold' : 'btn-outline-secondary text-dark'}`} onClick={() => setActiveSection('gestion')}>{t('user_management')}</button>
            </li>
            {user?.rol === 'Administrador' && (
              <li className="nav-item mb-2">
                <button className={`btn btn-sm w-100 text-start ${activeSection === 'promos' ? 'btn-light text-dark fw-bold' : 'btn-outline-secondary text-dark'}`} onClick={() => setActiveSection('promos')}>Promociones</button>
              </li>
            )}
            <li className="nav-item mb-2">
              <button className={`btn btn-sm w-100 text-start ${activeSection === 'ventas' ? 'btn-light text-dark fw-bold' : 'btn-outline-secondary text-dark'}`} onClick={() => setActiveSection('ventas')}>{user?.rol === 'Administrador' ? 'Historial Compras' : 'Mi Historial de Compras'}</button>
            </li>
            {user?.rol !== 'Administrador' && (
            <li className="nav-item mb-2">
              <button
                className={`btn btn-sm w-100 text-start ${activeSection === 'promosActivas' ? 'btn-light text-dark fw-bold' : 'btn-outline-secondary text-dark'}`}
                onClick={() => setActiveSection('promosActivas')}
              >
                Promociones Activas
              </button>
            </li>
          )}
          {user?.rol !== 'Administrador' && (
          <li className="nav-item mb-2">
            <button
              className={`btn btn-sm w-100 text-start ${activeSection === 'notificaciones' ? 'btn-light text-dark fw-bold' : 'btn-outline-secondary text-dark'}`}
              onClick={() => {
                setActiveSection('notificaciones');
                setTieneNotificacion(false);
              }}
            >
              Notificaciones
              {tieneNotificacion && <span className="badge bg-danger ms-2">¡NUEVA!</span>}
            </button>
          </li>
        )}
        </div>

        <div className="flex-grow-1 p-5">
          {activeSection === 'info' && (
            <>
              <h2 className="fw-bold mb-4" style={{ color: '#333' }}>Información del Usuario</h2>
              <div className="fw-bold mb-4" style={{ color: '#333' }}>Nombre:{user?.name}</div>
              <div className="fw-bold mb-4" style={{ color: '#333' }}>Apellidos:{user?.last_name}</div>
              <div className="fw-bold mb-4" style={{ color: '#333' }}>Correo:{user?.email}</div>
            </>
          )}

        {activeSection === 'citas' && <MostrarCitas />}
        
          {activeSection === 'gestion' && (
            <div className="bg-light p-4 rounded-4 shadow" style={{ border: '2px solid #ccc', maxWidth: '600px' }}>
              <h2 className="fw-bold mb-4" style={{ color: '#333' }}>{t('user_management')}</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{t('update_success')}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-dark fw-semibold">{t('name')}</label>
                  <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-dark fw-semibold">{t('last_name')}</label>
                  <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="form-label text-dark fw-semibold">{t('new_password')}</label>
                  <div className="input-group">
                    <input type={showPassword ? 'text' : 'password'} className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Cree una nueva contraseña" />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold">{t('save_changes')}</button>
              </form>
              <div className="mb-3">
                <label className="form-label text-dark fw-semibold">{t('language')}</label>
                <div className="d-flex gap-2">
                  <button onClick={() => setLanguage('es')}>{t('spanish')}</button>
                  <button onClick={() => setLanguage('en')}>{t('english')}</button>
                </div>
              </div>
            </div>
          )}

        {activeSection === 'promos' && (
          <div>
            <h2 className="fw-bold mb-4" style={{ color: '#333' }}>Gestion de Promociones</h2>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>{t('name')}</th>
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
                  <button className="btn btn-primary w-100 fw-bold"onClick={handlePromoSubmit}>
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
          <h2 className="fw-bold mb-4" style={{ color: '#333' }}>
            {user?.rol === 'Administrador' ? 'Historial de Compras' : 'Mi Historial de Compras'}
          </h2>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
              <tr>
                <th>Nombre del Cliente</th>
                <th>Fecha de Compra</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {salesHistory.map((sale, index) => (
                <tr key={sale.id ?? `sale-${index}`}>
                  <td>{sale.client || 'Desconocido'}</td>
                  <td>{sale.date || 'Fecha no disponible'}</td>
                  <td>{sale.description || '—'}</td>
                  <td>
                  <span className={`badge me-2 ${sale.status === 'EXITOSO' || sale.status === 'CONFIRMADA' ? 'bg-success' : 'bg-danger'}`}>
                    {sale.status || 'Sin estado'}
                  </span>
                  {user.rol === 'Administrador' && sale.status === 'PENDIENTE' && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => confirmarCompra(sale.id)}
                    >
                      Confirmar compra
                    </button>
                  )}
                </td>
                  <td>
                    {sale.total !== undefined
                      ? `$${sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : '$0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}
      {activeSection === 'promosActivas' && (
  <div>
    <h2 className="fw-bold mb-4" style={{ color: '#333' }}>Promociones Activas</h2>
    {promocionesActivas.length === 0 ? (
      <p>No hay promociones activas en este momento.</p>
    ) : (
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Descuento</th>
            </tr>
          </thead>
          <tbody>
            {promocionesActivas.map(promo => (
              <tr key={promo.id}>
                <td>{promo.title}</td>
                <td>{promo.start_date.split('T')[0]}</td>
                <td>{promo.end_date.split('T')[0]}</td>
                <td>{promo.porcentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
          )}
        </div>
      )}
      {activeSection === 'notificaciones' && (
      <div>
        <h2 className="fw-bold mb-4" style={{ color: '#333' }}>Notificaciones</h2>
        {(() => {
          const notifs = JSON.parse(localStorage.getItem(`notificaciones-${user?.email}`) || '[]');
          return notifs.length === 0 ? (
            <p>No tienes notificaciones nuevas.</p>
          ) : (
            <ul className="list-group">
              {notifs.map((n: any) => (
                <li key={n.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {n.mensaje}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => {
                    const nuevas = notifs.filter((x: any) => x.id !== n.id);
                    localStorage.setItem(`notificaciones-${user.email}`, JSON.stringify(nuevas));
                    setTieneNotificacion(false);
                  }}>
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          );
        })()}
      </div>
    )}
      </div>
    </div>
  </>
)
}
export default UserManagement


