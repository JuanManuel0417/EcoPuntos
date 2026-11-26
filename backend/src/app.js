// Configuración de Express: middlewares, rutas y manejo de errores
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rutas = require("./routes");
const { rutaNoEncontrada, manejarErrores } = require("./middlewares/errores");

// Todos los documentos se envían con "id" en lugar de "_id" y sin "__v"
mongoose.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

const app = express();

// Solo los frontends configurados pueden consumir la API desde el navegador.
// FRONTEND_URL acepta varias direcciones separadas por comas (local y producción).
const origenesPermitidos = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origen) => origen.trim().replace(/\/$/, ""))
  .filter(Boolean);
app.use(cors({ origin: origenesPermitidos }));
// Límite de 2 MB para permitir las fotos de los reportes
app.use(express.json({ limit: "2mb" }));

app.use("/api", rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
