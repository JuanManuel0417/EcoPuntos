// Módulo de reportes ambientales
const Reporte = require("../models/Reporte");
const ErrorApi = require("../utils/ErrorApi");
const { ESTADOS_REPORTE, ESTADOS_CON_PUNTOS, PUNTOS_POR_REPORTE } = require("../config/catalogos");
const { resumenUsuario } = require("../utils/puntos");

const TAMANO_MAXIMO_FOTO = 1.5 * 1024 * 1024; // caracteres de la data URL

// GET /api/reportes - todos los reportes de la comunidad
async function listar(req, res) {
  const reportes = await Reporte.find().sort({ fecha: -1 }).populate("usuario", "nombre");
  res.json(reportes);
}

// POST /api/reportes
async function crear(req, res) {
  const { categoria, titulo, ubicacion, descripcion, foto = "" } = req.body || {};

  if (foto && (!/^data:image\/(jpeg|png|webp);base64,/.test(foto) || foto.length > TAMANO_MAXIMO_FOTO)) {
    throw new ErrorApi(400, "La foto no es válida o es demasiado grande.");
  }

  const reporte = await Reporte.create({
    usuario: req.usuario._id,
    categoria,
    titulo,
    ubicacion,
    descripcion,
    foto,
    // Todo reporte nuevo empieza pendiente, sin importar lo que envíe el cliente
    estado: "pendiente",
  });

  await reporte.populate("usuario", "nombre");
  res.status(201).json(reporte);
}

// PATCH /api/reportes/:id/estado (admin)
async function cambiarEstado(req, res) {
  const { estado } = req.body || {};
  if (!ESTADOS_REPORTE.includes(estado)) throw new ErrorApi(400, "Estado no válido.");

  const reporte = await Reporte.findById(req.params.id);
  if (!reporte) throw new ErrorApi(404, "El reporte no existe.");

  // Si el cambio le quita los puntos al ciudadano, verifica que no los haya gastado
  const teniaPuntos = ESTADOS_CON_PUNTOS.includes(reporte.estado);
  const tendraPuntos = ESTADOS_CON_PUNTOS.includes(estado);
  if (teniaPuntos && !tendraPuntos) {
    const { saldo } = await resumenUsuario(reporte.usuario);
    if (saldo - PUNTOS_POR_REPORTE < 0) {
      throw new ErrorApi(409, "El ciudadano ya gastó los puntos de este reporte.");
    }
  }

  reporte.estado = estado;
  await reporte.save();
  await reporte.populate("usuario", "nombre");
  res.json(reporte);
}

// DELETE /api/reportes/:id - solo el autor y solo si sigue pendiente
async function eliminar(req, res) {
  const reporte = await Reporte.findOne({ _id: req.params.id, usuario: req.usuario._id });
  if (!reporte) throw new ErrorApi(404, "El reporte no existe.");
  if (reporte.estado !== "pendiente") throw new ErrorApi(409, "Solo puedes eliminar reportes pendientes.");

  await reporte.deleteOne();
  res.json({ mensaje: "Reporte eliminado." });
}

module.exports = { listar, crear, cambiarEstado, eliminar };
