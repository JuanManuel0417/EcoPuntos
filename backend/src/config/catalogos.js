// Catálogos y reglas de negocio de EcoPuntos

// Puntos que se ganan por kilo y CO2 evitado aproximado por kilo
const MATERIALES = [
  { id: "plastico", nombre: "Plástico", puntosPorKg: 10, co2PorKg: 1.5 },
  { id: "carton", nombre: "Cartón y papel", puntosPorKg: 5, co2PorKg: 0.9 },
  { id: "vidrio", nombre: "Vidrio", puntosPorKg: 8, co2PorKg: 0.3 },
  { id: "metal", nombre: "Metal y latas", puntosPorKg: 15, co2PorKg: 4 },
  { id: "electronicos", nombre: "Electrónicos", puntosPorKg: 20, co2PorKg: 2 },
];

const CATEGORIAS_REPORTE = ["basuras", "quema", "vertimiento", "tala", "escombros", "ruido", "otro"];

const ESTADOS_REPORTE = ["pendiente", "en_proceso", "resuelto", "rechazado"];

// Un reporte da puntos cuando el administrador lo valida (en proceso o resuelto)
const PUNTOS_POR_REPORTE = 20;
const ESTADOS_CON_PUNTOS = ["en_proceso", "resuelto"];

// El nivel depende de los puntos ganados en total (no del saldo)
const NIVELES = [
  { nombre: "Semilla", icono: "🌰", minimo: 0 },
  { nombre: "Brote", icono: "🌱", minimo: 100 },
  { nombre: "Árbol", icono: "🌳", minimo: 300 },
  { nombre: "Bosque", icono: "🌲", minimo: 700 },
];

const IDS_MATERIALES = MATERIALES.map((m) => m.id);
const material = (id) => MATERIALES.find((m) => m.id === id);

module.exports = {
  MATERIALES,
  IDS_MATERIALES,
  CATEGORIAS_REPORTE,
  ESTADOS_REPORTE,
  PUNTOS_POR_REPORTE,
  ESTADOS_CON_PUNTOS,
  NIVELES,
  material,
};
