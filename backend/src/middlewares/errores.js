// Respuestas para rutas inexistentes y manejo central de errores
const mongoose = require("mongoose");

function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: `La ruta ${req.method} ${req.originalUrl} no existe.` });
}

// Express 5 envía aquí también los errores de las funciones async
// eslint-disable-next-line no-unused-vars
function manejarErrores(error, req, res, next) {
  // Errores de validación de Mongoose: se devuelve el mensaje de cada campo
  if (error instanceof mongoose.Error.ValidationError) {
    const errores = Object.fromEntries(Object.entries(error.errors).map(([campo, e]) => [campo, e.message]));
    return res.status(400).json({ error: Object.values(errores)[0], errores });
  }

  // Identificador con formato inválido (por ejemplo /api/entregas/abc)
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: "El identificador no es válido." });
  }

  // Valor repetido en un campo único (por ejemplo el correo)
  if (error.code === 11000) {
    return res.status(409).json({ error: "Ya existe un registro con ese valor." });
  }

  // Cuerpo JSON mal formado o demasiado grande
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "La información enviada es demasiado grande (revisa el tamaño de la foto)." });
  }

  const status = error.status || 500;
  if (status === 500) console.error(error);
  res.status(status).json({ error: status === 500 ? "Ocurrió un error en el servidor." : error.message });
}

module.exports = { rutaNoEncontrada, manejarErrores };
