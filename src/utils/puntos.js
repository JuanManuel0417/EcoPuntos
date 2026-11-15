// Cálculo para la vista previa del formulario de reciclaje.
// El valor definitivo de los puntos lo calcula siempre el backend.
import { material } from '../data/catalogos'

export function calcularPuntos(materialId, kg) {
  const m = material(materialId)
  return m && kg > 0 ? Math.round(m.puntosPorKg * kg) : 0
}

export function calcularCo2(materialId, kg) {
  const m = material(materialId)
  return m && kg > 0 ? m.co2PorKg * kg : 0
}
