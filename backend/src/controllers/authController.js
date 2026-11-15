// Módulo de autenticación: registro, inicio de sesión y perfil
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const ErrorApi = require("../utils/ErrorApi");

function generarToken(usuario) {
  return jwt.sign({ id: usuario._id.toString(), rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRA || "8h",
  });
}

// POST /api/auth/registro
async function registrar(req, res) {
  const { nombre = "", correo = "", password = "" } = req.body || {};

  if (!/^[a-zA-ZÀ-ÿñÑ\s]{3,60}$/.test(nombre.trim())) {
    throw new ErrorApi(400, "Escribe tu nombre completo (solo letras, mínimo 3).");
  }
  if (password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    throw new ErrorApi(400, "La contraseña debe tener al menos 6 caracteres, con letras y números.");
  }
  if (await Usuario.exists({ correo: correo.trim().toLowerCase() })) {
    throw new ErrorApi(409, "Ya existe una cuenta con ese correo.");
  }

  // El rol siempre es ciudadano: un administrador no se puede crear desde el registro
  const usuario = await Usuario.create({ nombre, correo, password, rol: "ciudadano" });
  res.status(201).json({ token: generarToken(usuario), usuario: usuario.aPublico() });
}

// POST /api/auth/login
async function iniciarSesion(req, res) {
  const { correo = "", password = "" } = req.body || {};
  if (!correo || !password) throw new ErrorApi(400, "Escribe tu correo y tu contraseña.");

  const usuario = await Usuario.findOne({ correo: correo.trim().toLowerCase() }).select("+password");
  if (!usuario || !(await usuario.compararPassword(password))) {
    throw new ErrorApi(401, "Correo o contraseña incorrectos.");
  }

  res.json({ token: generarToken(usuario), usuario: usuario.aPublico() });
}

// GET /api/auth/perfil
function perfil(req, res) {
  res.json({ usuario: req.usuario.aPublico() });
}

module.exports = { registrar, iniciarSesion, perfil };
