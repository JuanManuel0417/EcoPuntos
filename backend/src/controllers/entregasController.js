// Módulo de entregas de reciclaje
const Entrega = require("../models/Entrega");
const PuntoAcopio = require("../models/PuntoAcopio");
const ErrorApi = require("../utils/ErrorApi");
const { calcularPuntos, resumenUsuario } = require("../utils/puntos");

// GET /api/entregas - entregas del usuario conectado, de la más reciente a la más antigua
async function listarMias(req, res) {
  const entregas = await Entrega.find({ usuario: req.usuario._id })
    .sort({ fecha: -1, createdAt: -1 })
    .populate("puntoAcopio", "nombre direccion");
  res.json(entregas);
}

// POST /api/entregas
async function crear(req, res) {
  const { material, kg, puntoAcopio, fecha, observaciones = "" } = req.body || {};

  if (!puntoAcopio) throw new ErrorApi(400, "Elige el punto de acopio.");
  const punto = await PuntoAcopio.findOne({ _id: puntoAcopio, activo: true });
  if (!punto) throw new ErrorApi(400, "El punto de acopio no existe.");
  if (material && !punto.materiales.includes(material)) {
    throw new ErrorApi(400, "Ese punto de acopio no recibe este material.");
  }

  const fechaEntrega = new Date(fecha);
  if (!fecha || Number.isNaN(fechaEntrega.getTime())) throw new ErrorApi(400, "Elige la fecha de la entrega.");
  // Se permite un día de margen por las diferencias de zona horaria
  if (fechaEntrega.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    throw new ErrorApi(400, "La fecha no puede ser futura.");
  }

  const peso = Math.round(Number(kg) * 10) / 10;
  const entrega = await Entrega.create({
    usuario: req.usuario._id,
    material,
    kg: peso,
    puntoAcopio: punto._id,
    // Los puntos los calcula el servidor; nunca se confía en un valor enviado por el cliente
    puntos: calcularPuntos(material, peso),
    observaciones,
    fecha: fechaEntrega,
  });

  await entrega.populate("puntoAcopio", "nombre direccion");
  res.status(201).json(entrega);
}

// DELETE /api/entregas/:id
async function eliminar(req, res) {
  const entrega = await Entrega.findOne({ _id: req.params.id, usuario: req.usuario._id });
  if (!entrega) throw new ErrorApi(404, "La entrega no existe.");

  // No se permite borrar una entrega cuyos puntos ya se gastaron en canjes
  const { saldo } = await resumenUsuario(req.usuario._id);
  if (saldo - entrega.puntos < 0) {
    throw new ErrorApi(409, "No puedes eliminar esta entrega: sus puntos ya fueron usados en canjes.");
  }

  await entrega.deleteOne();
  res.json({ mensaje: "Entrega eliminada." });
}

module.exports = { listarMias, crear, eliminar };
