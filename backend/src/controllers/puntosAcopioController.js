// Módulo de puntos de acopio
const PuntoAcopio = require("../models/PuntoAcopio");
const ErrorApi = require("../utils/ErrorApi");

// GET /api/puntos-acopio
async function listar(req, res) {
  const puntos = await PuntoAcopio.find({ activo: true }).sort({ nombre: 1 });
  res.json(puntos);
}

// POST /api/puntos-acopio (admin)
async function crear(req, res) {
  const { nombre, direccion, horario, materiales } = req.body || {};
  const punto = await PuntoAcopio.create({ nombre, direccion, horario, materiales });
  res.status(201).json(punto);
}

// DELETE /api/puntos-acopio/:id (admin) - se desactiva para conservar el historial de entregas
async function eliminar(req, res) {
  const punto = await PuntoAcopio.findByIdAndUpdate(req.params.id, { activo: false });
  if (!punto) throw new ErrorApi(404, "El punto de acopio no existe.");
  res.json({ mensaje: "Punto de acopio eliminado." });
}

module.exports = { listar, crear, eliminar };
