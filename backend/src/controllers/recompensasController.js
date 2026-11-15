// Módulo de recompensas y canjes
const crypto = require("crypto");
const Recompensa = require("../models/Recompensa");
const Canje = require("../models/Canje");
const ErrorApi = require("../utils/ErrorApi");
const { resumenUsuario } = require("../utils/puntos");

// GET /api/recompensas
async function listar(req, res) {
  const recompensas = await Recompensa.find({ activa: true }).sort({ costo: 1 });
  res.json(recompensas);
}

// POST /api/recompensas (admin)
async function crear(req, res) {
  const { nombre, descripcion, icono, costo, stock } = req.body || {};
  if (!Number.isInteger(Number(costo)) || !Number.isInteger(Number(stock))) {
    throw new ErrorApi(400, "El costo y las unidades deben ser números enteros.");
  }
  const recompensa = await Recompensa.create({ nombre, descripcion, icono, costo, stock });
  res.status(201).json(recompensa);
}

// DELETE /api/recompensas/:id (admin) - se desactiva; los canjes hechos se conservan
async function eliminar(req, res) {
  const recompensa = await Recompensa.findByIdAndUpdate(req.params.id, { activa: false });
  if (!recompensa) throw new ErrorApi(404, "La recompensa no existe.");
  res.json({ mensaje: "Recompensa eliminada." });
}

// POST /api/recompensas/:id/canjear
async function canjear(req, res) {
  const recompensa = await Recompensa.findOne({ _id: req.params.id, activa: true });
  if (!recompensa) throw new ErrorApi(404, "La recompensa no existe.");

  const { saldo } = await resumenUsuario(req.usuario._id);
  if (saldo < recompensa.costo) throw new ErrorApi(409, "No tienes puntos suficientes.");

  // Descuenta una unidad solo si todavía hay stock (operación atómica en MongoDB)
  const actualizada = await Recompensa.findOneAndUpdate(
    { _id: recompensa._id, activa: true, stock: { $gt: 0 } },
    { $inc: { stock: -1 } },
    { returnDocument: "after" }
  );
  if (!actualizada) throw new ErrorApi(409, "Esta recompensa está agotada.");

  const canje = await Canje.create({
    usuario: req.usuario._id,
    recompensa: recompensa._id,
    nombre: recompensa.nombre,
    icono: recompensa.icono,
    costo: recompensa.costo,
    codigo: "ECO-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
  });

  res.status(201).json({ canje, recompensa: actualizada });
}

// GET /api/canjes - canjes del usuario conectado
async function misCanjes(req, res) {
  const canjes = await Canje.find({ usuario: req.usuario._id }).sort({ fecha: -1 });
  res.json(canjes);
}

module.exports = { listar, crear, eliminar, canjear, misCanjes };
