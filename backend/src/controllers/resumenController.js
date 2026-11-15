// Resumen del usuario para el panel de inicio y catálogos de la aplicación
const Entrega = require("../models/Entrega");
const Reporte = require("../models/Reporte");
const Canje = require("../models/Canje");
const catalogos = require("../config/catalogos");
const { resumenUsuario, puntosDeReporte } = require("../utils/puntos");

// GET /api/resumen - saldo, nivel, totales y actividad reciente
async function obtener(req, res) {
  const usuario = req.usuario._id;

  const [resumen, entregas, reportes, canjes] = await Promise.all([
    resumenUsuario(usuario),
    Entrega.find({ usuario }).sort({ fecha: -1 }).limit(6).populate("puntoAcopio", "nombre"),
    Reporte.find({ usuario }).sort({ fecha: -1 }).limit(6).select("-foto"),
    Canje.find({ usuario }).sort({ fecha: -1 }).limit(6),
  ]);

  // Une los tres tipos de movimiento en una sola lista ordenada por fecha
  const actividad = [
    ...entregas.map((e) => ({
      id: e.id, tipo: "entrega", fecha: e.fecha, material: e.material, kg: e.kg,
      detalle: e.puntoAcopio?.nombre || "", puntos: e.puntos,
    })),
    ...reportes.map((r) => ({
      id: r.id, tipo: "reporte", fecha: r.fecha, categoria: r.categoria, titulo: r.titulo,
      estado: r.estado, puntos: puntosDeReporte(r.estado),
    })),
    ...canjes.map((c) => ({
      id: c.id, tipo: "canje", fecha: c.fecha, nombre: c.nombre, icono: c.icono,
      codigo: c.codigo, puntos: -c.costo,
    })),
  ]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 6);

  const respuesta = { resumen, actividad };
  if (req.usuario.rol === "admin") {
    respuesta.reportesPendientes = await Reporte.countDocuments({ estado: "pendiente" });
  }
  res.json(respuesta);
}

// GET /api/catalogos - reglas de negocio públicas (materiales, estados, niveles)
function obtenerCatalogos(req, res) {
  const { MATERIALES, CATEGORIAS_REPORTE, ESTADOS_REPORTE, PUNTOS_POR_REPORTE, NIVELES } = catalogos;
  res.json({ MATERIALES, CATEGORIAS_REPORTE, ESTADOS_REPORTE, PUNTOS_POR_REPORTE, NIVELES });
}

module.exports = { obtener, obtenerCatalogos };
