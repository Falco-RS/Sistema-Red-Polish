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

const Appointments = () => {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    setTimeout(() => {
      if (user?.rol === 'Administrador') {
        const adminAppointments: Appointment[] = [
          {
            id: 1,
            clientName: 'Carlos Gómez',
            date: '2025-05-23',
            time: '10:00 AM',
            serviceName: 'Lavado',
            paymentMethod: 'Efectivo',
            paymentStatus: 'Pagado',
            total: 25000,
          },
          {
            id: 2,
            clientName: 'Laura Ríos',
            date: '2025-06-30',
            time: '02:30 PM',
            serviceName: 'Protección Básica',
            paymentMethod: 'SINPE',
            paymentStatus: 'Pendiente',
            total: 30000,
          },
        ]
        setAppointments(adminAppointments)
      } else {
        const userAppointments: Appointment[] = [
          {
            id: 1,
            date: '2025-06-23',
            time: '10:00 AM',
            serviceName: 'Lavado',
            paymentMethod: 'Efectivo',
            paymentStatus: 'Pagado',
            total: 25000,
          },
          {
            id: 2,
            date: '2025-06-21',
            time: '11:00 AM',
            serviceName: 'Pulido',
            paymentMethod: 'Transferencia',
            paymentStatus: 'Pagado',
            total: 30000,
          },
        ]
        setAppointments(userAppointments)
      }
      setLoading(false)
    }, 1000)
  }, [user])

  const handleCancel = (appt: Appointment) => {
    const appointmentDate = new Date(appt.date)
    const currentDate = new Date()
    const timeDiff = appointmentDate.getTime() - currentDate.getTime()
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    if (daysLeft < 10) return // Protección extra si el botón no está deshabilitado por error

    if (user?.rol === 'Administrador') {
      setMessage('IMPORTANTE: hacer la devolución en menos de 10 días')
    } else {
        setShowPrompt(true)
        setMessage('Su dinero se devolverá en menos de 10 días')
    }

    // Aquí podrías también eliminar la cita de la lista si quieres
    // setAppointments(prev => prev.filter(a => a.id !== appt.id))
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
