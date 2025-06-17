import { useState, useEffect } from 'react'
import NavBar from '../../common/NavBar'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../common/AuthContext'


interface CitaOcupada {
  fecha: string
  hora: string
  duracion: string
}

const EditCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHours, setSelectedHours] = useState<number[]>([])
  const [saved, setSaved] = useState(false)
  const [rangosNoDisponibles, setRangosNoDisponibles] = useState<[Date, Date][]>([])

  const { user, token} = useAuth(); 
  const navigate = useNavigate()
  const { t } = useTranslation('global')
  const apiUrl = import.meta.env.VITE_IP_API

  const hours = Array.from({ length: 10 }, (_, i) => i + 8) // 8 a 17

  const handleHourToggle = (hour: number) => {
    setSelectedHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    )
  }

  const isHoraOcupada = (hour: number) => {
    if (!selectedDate) return false

    const dateToCheck = new Date(selectedDate)
    dateToCheck.setHours(hour, 0, 0, 0)

    return rangosNoDisponibles.some(([inicio, fin]) =>
      dateToCheck >= inicio && dateToCheck < fin
    )
  }

  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff'

    const fetchHorasOcupadas = async () => {
      if (!selectedDate) return

      const fechaISO = selectedDate.toISOString().split('T')[0]

      try {
        const response = await fetch(`${apiUrl}/api/citas/busy?fecha=${fechaISO}`)
        if (!response.ok) throw new Error('Error al obtener datos de disponibilidad')

        const data: CitaOcupada[] = await response.json()

        console.log(response)
        const rangos = data.map(cita => {
          const inicio = new Date(`${cita.fecha}T${cita.hora}`)
          const fin = new Date(inicio.getTime() + parseInt(cita.duracion) * 60000)
          return [inicio, fin] as [Date, Date]
        })

        setRangosNoDisponibles(rangos)
      } catch (error) {
        console.error('Error al obtener horas no disponibles:', error)
        setRangosNoDisponibles([])
      }
    }

    fetchHorasOcupadas()
  }, [selectedDate])

  const handleSave = async () => {
    if (!selectedDate || selectedHours.length === 0) {
      alert(t('alert_missing'))
      return
    }

    const dateStr = selectedDate.toISOString().split('T')[0]
    const email = user.email 
    let successCount = 0

    try {
      for (const hour of selectedHours) {
        const hourStr = `${hour.toString().padStart(2, '0')}:00`

        const url = `${apiUrl}/api/citas/busy_day/add/${email}?fecha=${dateStr}&hour=${hourStr}`

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) throw new Error(`Fallo al guardar ${hourStr}`)
        successCount++
      }

      if (successCount === selectedHours.length) {
        alert('✅ Todas las horas fueron ocupadas con éxito')
      } else {
        alert('⚠️ Algunas horas no pudieron ocuparse')
      }

      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        navigate('/services')
      }, 3000)

    } catch (error) {
      console.error('❌ Error al bloquear horas:', error)
      alert('Hubo un error al guardar la disponibilidad.')
    }
  }

  return (
    <>
      <NavBar />
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1000 }}>
        <div className="bg-white rounded-4 shadow-lg p-5 w-100" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4 text-dark fw-bold">{t('title_calendar')}</h2>

          {saved && <div className="alert alert-success">{t('saved')}</div>}

          <div className="mb-3">
            <label className="text-primary fw-bold">{t('select_date_c')}</label>
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
              <label className="text-dark">{t('available_hours')}</label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {hours.map(hour => {
                  const ocupado = isHoraOcupada(hour)
                  const selected = selectedHours.includes(hour)
                  return (
                    <button
                      key={hour}
                      type="button"
                      className={`btn btn-sm ${ocupado ? 'btn-secondary disabled' : selected ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => !ocupado && handleHourToggle(hour)}
                      disabled={ocupado}
                    >
                      {hour}:00
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button onClick={handleSave} className="btn btn-primary w-100 fw-bold mb-3">
            {t('save_c')}
          </button>

          <div className="text-center">
            <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/services')}>
              {t('cancel_add')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditCalendar
