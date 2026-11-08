// Catálogos fijos de EcoPuntos (en el Laboratorio III vendrán de la base de datos)

// Puntos que se ganan por kilo y CO2 evitado aproximado por kilo
export const MATERIALES = [
  { id: 'plastico', nombre: 'Plástico', icono: '🧴', puntosPorKg: 10, co2PorKg: 1.5 },
  { id: 'carton', nombre: 'Cartón y papel', icono: '📦', puntosPorKg: 5, co2PorKg: 0.9 },
  { id: 'vidrio', nombre: 'Vidrio', icono: '🍾', puntosPorKg: 8, co2PorKg: 0.3 },
  { id: 'metal', nombre: 'Metal y latas', icono: '🥫', puntosPorKg: 15, co2PorKg: 4 },
  { id: 'electronicos', nombre: 'Electrónicos', icono: '🔌', puntosPorKg: 20, co2PorKg: 2 },
]

export const PUNTOS_ACOPIO = [
  {
    id: 'pa1',
    nombre: 'Punto Verde I.U. Pascual Bravo',
    direccion: 'Calle 73 # 73A-226, Robledo',
    horario: 'Lun a Vie, 7:00 a.m. - 6:00 p.m.',
    materiales: ['plastico', 'carton', 'vidrio', 'metal', 'electronicos'],
  },
  {
    id: 'pa2',
    nombre: 'Centro de Acopio Robledo',
    direccion: 'Carrera 80 # 65-10, Robledo',
    horario: 'Lun a Sáb, 8:00 a.m. - 5:00 p.m.',
    materiales: ['plastico', 'carton', 'vidrio', 'metal'],
  },
  {
    id: 'pa3',
    nombre: 'EcoEstación Parque Central',
    direccion: 'Calle 50 # 45-20, Centro',
    horario: 'Todos los días, 9:00 a.m. - 7:00 p.m.',
    materiales: ['plastico', 'carton', 'metal'],
  },
  {
    id: 'pa4',
    nombre: 'Punto RAEE Belén',
    direccion: 'Carrera 76 # 30-15, Belén',
    horario: 'Mar a Sáb, 9:00 a.m. - 4:00 p.m.',
    materiales: ['electronicos', 'metal'],
  },
]

export const CATEGORIAS_REPORTE = [
  { id: 'basuras', nombre: 'Basuras acumuladas', icono: '🗑️' },
  { id: 'quema', nombre: 'Quema a cielo abierto', icono: '🔥' },
  { id: 'vertimiento', nombre: 'Vertimiento en fuente de agua', icono: '💧' },
  { id: 'tala', nombre: 'Tala o árbol caído', icono: '🌳' },
  { id: 'escombros', nombre: 'Escombros', icono: '🧱' },
  { id: 'ruido', nombre: 'Contaminación por ruido', icono: '📢' },
  { id: 'otro', nombre: 'Otro', icono: '❗' },
]

// Las clases de color se escriben completas para que Tailwind las detecte
export const ESTADOS_REPORTE = {
  pendiente: { nombre: 'Pendiente', clase: 'bg-amber-100 text-amber-800' },
  en_proceso: { nombre: 'En proceso', clase: 'bg-sky-100 text-sky-800' },
  resuelto: { nombre: 'Resuelto', clase: 'bg-emerald-100 text-emerald-800' },
  rechazado: { nombre: 'Rechazado', clase: 'bg-rose-100 text-rose-800' },
}

// Un reporte da puntos cuando el administrador lo valida
export const PUNTOS_POR_REPORTE = 20
export const ESTADOS_CON_PUNTOS = ['en_proceso', 'resuelto']

// El nivel depende de los puntos ganados en total (no del saldo actual)
export const NIVELES = [
  { nombre: 'Semilla', icono: '🌰', minimo: 0 },
  { nombre: 'Brote', icono: '🌱', minimo: 100 },
  { nombre: 'Árbol', icono: '🌳', minimo: 300 },
  { nombre: 'Bosque', icono: '🌲', minimo: 700 },
]

export const ICONOS_RECOMPENSA = ['🎁', '☕', '👜', '🌱', '🥤', '🏷️', '🎬', '📚', '🚲', '👕']

const buscarPorId = (lista, id) => lista.find((item) => item.id === id)

export const material = (id) => buscarPorId(MATERIALES, id)
export const puntoAcopio = (id) => buscarPorId(PUNTOS_ACOPIO, id)
export const categoria = (id) => buscarPorId(CATEGORIAS_REPORTE, id)
export const puntosAcopioPara = (materialId) =>
  PUNTOS_ACOPIO.filter((p) => p.materiales.includes(materialId))
