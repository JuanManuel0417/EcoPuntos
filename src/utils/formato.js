// Funciones de formato para fechas y números en español de Colombia

const formatoFecha = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
const formatoNumero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

export const fecha = (iso) => formatoFecha.format(new Date(iso))
export const numero = (valor) => formatoNumero.format(valor)

// Fecha de hoy en formato AAAA-MM-DD (hora local), útil para los <input type="date">
export const hoyISO = () => new Date().toLocaleDateString('en-CA')

export function fechaLarga(date = new Date()) {
  const texto = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date)
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
