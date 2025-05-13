import { useState } from 'react'
import NavBar from '../../common/NavBar'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useNavigate } from 'react-router-dom'

const EditCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHours, setSelectedHours] = useState<number[]>([])
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  const hours = Array.from({ length: 10 }, (_, i) => i + 8) // Horas de 8 a 17

  const noDisponibles = [
    { fecha: '2025-05-13', horas: [9, 10, 14] }, 
    { fecha: '2025-05-14', horas: [13, 15] },   
  ]

  const handleHourToggle = (hour: number) => {
    setSelectedHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    )
  }

  const handleSave = () => {
    if (!selectedDate || selectedHours.length === 0) {
      alert('Selecciona una fecha y al menos una hora')
      return
    }

    const dateStr = selectedDate.toISOString().split('T')[0]
    console.log('🗓️ Guardando no disponibles:', { fecha: dateStr, horas: selectedHours })

    // Aquí iría la lógica para guardar la disponibilidad en el backend
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      navigate('/services') // redirige donde gustes
    }, 3000)
  }

  return (
    <>
      <NavBar />
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
        <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4 text-danger fw-bold">Modificar Calendario</h2>

          {saved && <div className="alert alert-success">Disponibilidad actualizada correctamente.</div>}

          <div className="mb-3">
            <label className="text-danger fw-bold">Selecciona una fecha</label>
            <DatePicker
              selected={selectedDate}
              onChange={date => {
                setSelectedDate(date)
                setSelectedHours([]) // limpiar horas si cambia el día
              }}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              className="form-control"
              placeholderText="Haz clic para elegir una fecha"
            />
          </div>

          {selectedDate && (
            <div className="mb-4">
              <label className="text-danger fw-bold">Horas disponibles: las que marques dejaran de estar disponible para los usuarios</label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {hours
                .filter(hour => {
                    const dateStr = selectedDate.toISOString().split('T')[0]
                    const noDisp = noDisponibles.find(nd => nd.fecha === dateStr)
                    return !noDisp || !noDisp.horas.includes(hour)
                })
                .map(hour => (
                    <button
                    key={hour}
                    type="button"
                    className={`btn ${selectedHours.includes(hour) ? 'btn-danger' : 'btn-outline-danger'} btn-sm`}
                    onClick={() => handleHourToggle(hour)}
                    >
                    {hour}:00
                    </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleSave} className="btn btn-danger w-100 fw-bold mb-3">
            Guardar disponibilidad
          </button>

          <div className="text-center">
            <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/services')}>
              Cancelar y volver
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditCalendar
