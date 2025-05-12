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


