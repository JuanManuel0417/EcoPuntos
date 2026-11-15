// Cálculo de puntos, CO2 evitado y saldo de cada usuario
const mongoose = require("mongoose");
const Entrega = require("../models/Entrega");
const Reporte = require("../models/Reporte");
const Canje = require("../models/Canje");
const { NIVELES, PUNTOS_POR_REPORTE, ESTADOS_CON_PUNTOS, material } = require("../config/catalogos");

function calcularPuntos(materialId, kg) {
  const m = material(materialId);
  return m && kg > 0 ? Math.round(m.puntosPorKg * kg) : 0;
}

const puntosDeReporte = (estado) => (ESTADOS_CON_PUNTOS.includes(estado) ? PUNTOS_POR_REPORTE : 0);

// El saldo se calcula siempre a partir de los movimientos, así nunca queda desfasado
async function resumenUsuario(usuarioId) {
  const id = new mongoose.Types.ObjectId(usuarioId);

  const [entregasPorMaterial, reportes, canjes] = await Promise.all([
    Entrega.aggregate([
      { $match: { usuario: id } },
      { $group: { _id: "$material", kg: { $sum: "$kg" }, puntos: { $sum: "$puntos" }, cantidad: { $sum: 1 } } },
    ]),
    Reporte.aggregate([
      { $match: { usuario: id } },
      { $group: { _id: "$estado", cantidad: { $sum: 1 } } },
    ]),
    Canje.aggregate([
      { $match: { usuario: id } },
      { $group: { _id: null, gastados: { $sum: "$costo" }, cantidad: { $sum: 1 } } },
    ]),
  ]);

  const puntosEntregas = entregasPorMaterial.reduce((t, e) => t + e.puntos, 0);
  const reportesValidados = reportes
    .filter((r) => ESTADOS_CON_PUNTOS.includes(r._id))
    .reduce((t, r) => t + r.cantidad, 0);
  const ganados = puntosEntregas + reportesValidados * PUNTOS_POR_REPORTE;
  const gastados = canjes[0]?.gastados || 0;

  let indice = 0;
  NIVELES.forEach((nivel, i) => {
    if (ganados >= nivel.minimo) indice = i;
  });
  const nivel = NIVELES[indice];
  const siguienteNivel = NIVELES[indice + 1] || null;
  const progreso = siguienteNivel
    ? Math.round(((ganados - nivel.minimo) / (siguienteNivel.minimo - nivel.minimo)) * 100)
    : 100;

  return {
    saldo: ganados - gastados,
    ganados,
    gastados,
    kg: Math.round(entregasPorMaterial.reduce((t, e) => t + e.kg, 0) * 10) / 10,
    co2: Math.round(entregasPorMaterial.reduce((t, e) => t + e.kg * (material(e._id)?.co2PorKg || 0), 0) * 10) / 10,
    kgPorMaterial: Object.fromEntries(entregasPorMaterial.map((e) => [e._id, Math.round(e.kg * 10) / 10])),
    totalEntregas: entregasPorMaterial.reduce((t, e) => t + e.cantidad, 0),
    totalReportes: reportes.reduce((t, r) => t + r.cantidad, 0),
    reportesValidados,
    totalCanjes: canjes[0]?.cantidad || 0,
    nivel,
    siguienteNivel,
    progreso,
  };
}

module.exports = { calcularPuntos, puntosDeReporte, resumenUsuario };
