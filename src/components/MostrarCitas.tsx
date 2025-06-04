// components/Appointments.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '../common/AuthContext'
import { Spinner, Button, Alert } from 'react-bootstrap'

interface Appointment {
  id: number
  clientName?: string
  date: string
  time: string
  serviceName: string
  paymentMethod: string
  paymentStatus: string
  total: number
}

const apiUrl = 'https://tu-servidor.com' // <-- Ajusta esto según tu backend

const Appointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return
      try {
        let url = ''
        if (user.rol === 'Administrador') {
          url = `${apiUrl}/api/citas/get_all`
        } else {
          url = `${apiUrl}/api/citas/get/${user.id}`
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          setError(errorData.message || 'Error al mostrar los datos.')
          setLoading(false)
          return
        }

        const data = await response.json()
        setAppointments(data)
      } catch (err) {
        setError('Error de red al obtener las citas.')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  const handleCancel = (appt: Appointment) => {
    const appointmentDate = new Date(appt.date)
    const currentDate = new Date()
    const timeDiff = appointmentDate.getTime() - currentDate.getTime()
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    if (daysLeft < 10) return 

    if (user?.rol === 'Administrador') {
      setMessage('IMPORTANTE: hacer la devolución en menos de 10 días')
    } else {
        setShowPrompt(true)
        setMessage('Su dinero se devolverá en menos de 10 días')
    }

  }

  if (loading) return <Spinner animation="border" variant="danger" />

  
  return (
    <div className="p-4">
        <h3 className="text-danger fw-bold mb-4">
        {user?.rol === 'Administrador' ? 'Todas las Citas' : 'Mis Citas'}
        </h3>

        {message && (
        <Alert variant="warning" onClose={() => setMessage(null)} dismissible>
            {message}
        </Alert>
        )}

        <div className="table-responsive mt-3">
        <table className="table table-bordered table-hover">
            <thead className="table-danger text-center">
            <tr>
                {user?.rol === 'Administrador' && <th>Cliente</th>}
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Forma de pago</th>
                <th>Estado de pago</th>
                <th>Total</th>
                <th>Acción</th>
            </tr>
            </thead>
            <tbody className="text-center">
            {appointments.map((appt) => {
                const appointmentDate = new Date(appt.date)
                const currentDate = new Date()
                const timeDiff = appointmentDate.getTime() - currentDate.getTime()
                const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
                const canCancel = daysLeft >= 10

                return (
                <tr key={appt.id}>
                    {user?.rol === 'Administrador' && <td>{appt.clientName}</td>}
                    <td>{appt.date}</td>
                    <td>{appt.time}</td>
                    <td>{appt.serviceName}</td>
                    <td>{appt.paymentMethod}</td>
                    <td>{appt.paymentStatus}</td>
                    <td>
                    {appt.total.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                    })}
                    </td>
                    <td>
                    <Button
                        variant="danger"
                        size="sm"
                        disabled={!canCancel}
                        onClick={() => handleCancel(appt)}
                    >
                        Cancelar
                    </Button>
                    </td>
                </tr>
                )
            })}
            </tbody>
        </table>
        </div>

        {/* Cuadro emergente */}
        {showPrompt && (
        <div
            style={{
            position: 'fixed',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            color: 'black',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            zIndex: 1050,
            minWidth: '300px',
            }}
        >
            <h5 className="fw-bold mb-3">
            Digite un número de teléfono para devolver su dinero por medio de un <strong>SINPE</strong>
            </h5>
            <input
            type="tel"
            className="form-control mb-3"
            placeholder="Ejemplo: +50660000000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div className="d-flex justify-content-between">
            <Button
                variant="secondary"
                onClick={() => {
                setShowPrompt(false)
                setPhoneNumber('')
                }}
            >
                Ya no quiero cancelar
            </Button>
            <Button
                variant="success"
                onClick={() => setShowPrompt(false)}
                disabled={!/^\+\d{3,4}\d{7,}$/.test(phoneNumber)}
            >
                Terminar de solicitar la cancelación
            </Button>
            </div>
        </div>
        )}
    </div>
    )


}

export default Appointments
