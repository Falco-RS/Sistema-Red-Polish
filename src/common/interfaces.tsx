export interface Servicio {
  id: number
  nombre: string
  id_categoria: number
  descripcion: string
  duracion: string
  precio: number
  id_promocion?: number
  imagen?: string
}

export interface Categoria {
  id: number
  nombre: string
}

export interface ServicioConPrecio extends Servicio {
  precioFinal?: number
  porcentajeDescuento?: number
}

export interface Props {
  servicio: Servicio
  fechaSeleccionada: Date | null
  horaSeleccionada: Date | null
  setHoraSeleccionada: (hora: Date) => void
}

export interface CitaOcupada {
  fecha: string
  hora: string
  duracion: string
}
