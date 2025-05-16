import React, { useEffect, useState } from 'react'
import { Props, CitaOcupada } from '../common//interfaces' // ajusta la ruta según tu proyecto

const HorasDisponibles: React.FC<Props> = ({
  servicio,
  fechaSeleccionada,
  horaSeleccionada,
  setHoraSeleccionada,
}) => {
  const [rangosNoDisponibles, setRangosNoDisponibles] = useState<[Date, Date][]>([])

  useEffect(() => {
    const obtenerHorasNoDisponibles = async () => {
      if (fechaSeleccionada && servicio?.id) {
        const fechaISO = fechaSeleccionada.toISOString().split('T')[0]

        try {
          const response = await fetch(
            `http://localhost:8080/api/citas/ocupadas?servicio_id=${servicio.id}&fecha=${fechaISO}`
          )
          if (!response.ok) throw new Error('Error al obtener datos de disponibilidad')

          const data: CitaOcupada[] = await response.json()

          const rangos = data.map((cita) => {
            const inicio = new Date(`${cita.fecha}T${cita.hora}`)
            const fin = new Date(inicio.getTime() + parseInt(cita.duracion) * 60000)
            return [inicio, fin] as [Date, Date]
          })

          setRangosNoDisponibles(rangos)
        } catch (error) {
          console.error('Error al obtener horas no disponibles:', error)
          setRangosNoDisponibles([])
        }
      } else {
        setRangosNoDisponibles([])
      }
    }

    obtenerHorasNoDisponibles()
  }, [fechaSeleccionada, servicio])

  const generarHorasDisponibles = () => {
    const resultado: Date[] = []
    if (!fechaSeleccionada || !servicio?.duracion) return resultado

    const duracion = parseInt(servicio.duracion)
    const inicio = new Date(fechaSeleccionada)
    inicio.setHours(8, 0, 0, 0)

    const finNegocio = new Date(fechaSeleccionada)
    finNegocio.setHours(17, 0, 0, 0)

    // Calculamos la última hora en la que puede iniciar el servicio sin exceder el cierre
    const ultimaHoraInicio = new Date(finNegocio.getTime() - duracion * 60000)

    while (inicio <= ultimaHoraInicio) {
    resultado.push(new Date(inicio))
    inicio.setMinutes(inicio.getMinutes() + 30)
    }

    return resultado
    }

  const horasDisponibles = generarHorasDisponibles()

  const estaDisponible = (inicio: Date) => {
    const duracion = parseInt(servicio.duracion)
    const fin = new Date(inicio.getTime() + duracion * 60000)

    for (const [ocupadoInicio, ocupadoFin] of rangosNoDisponibles) {
      if (inicio < ocupadoFin && fin > ocupadoInicio) {
        return false
      }
    }

    return true
  }

  return (
    <div>
      <h5 className="mt-3">Horas disponibles</h5>
      <div className="d-flex flex-wrap gap-2">
        {horasDisponibles.map((hora, index) => {
          const horaFormateada = hora.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })

          const disponible = estaDisponible(hora)

          return (
            <button
              key={index}
              className={`btn ${
                horaSeleccionada &&
                hora.getTime() === horaSeleccionada.getTime()
                  ? 'btn-danger'
                  : 'btn-outline-danger'
              }`}
              onClick={() => disponible && setHoraSeleccionada(hora)}
              disabled={!disponible}
            >
              {horaFormateada}
            </button>
          )
        })}
      </div>

      {horasDisponibles.every((hora) => !estaDisponible(hora)) && (
        <p className="text-muted mt-2">No hay horas disponibles para esta fecha.</p>
      )}
    </div>
  )
}

export default HorasDisponibles
