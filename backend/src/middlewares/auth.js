// Protección de rutas con JSON Web Token (JWT)
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const ErrorApi = require("../utils/ErrorApi");

// Exige un token válido en el encabezado: Authorization: Bearer <token>
async function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");

  if (tipo !== "Bearer" || !token) {
    throw new ErrorApi(401, "Debes iniciar sesión.");
  }

  let datos;
  try {
    datos = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ErrorApi(401, "Tu sesión expiró. Inicia sesión de nuevo.");
  }

  const usuario = await Usuario.findById(datos.id);
  if (!usuario) throw new ErrorApi(401, "El usuario de la sesión ya no existe.");

  req.usuario = usuario;
  next();
}

// Solo permite el paso a administradores (se usa después de verificarToken)
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== "admin") {
    throw new ErrorApi(403, "Esta acción es solo para administradores.");
  }
  next();
}

module.exports = { verificarToken, soloAdmin };
