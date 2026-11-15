/*
 * EcoPuntos - Backend
 * Archivo: server.js
 * Carga las variables de entorno, conecta con MongoDB Atlas y abre el puerto.
 */

require("dotenv").config({ quiet: true });

const app = require("./src/app");
const conectarBaseDeDatos = require("./src/config/database");

const PORT = process.env.PORT || 4000;

async function iniciar() {
  if (!process.env.JWT_SECRET) {
    throw new Error("Falta JWT_SECRET en el archivo .env.");
  }

  await conectarBaseDeDatos();

  app.listen(PORT, () => {
    console.log(`API de EcoPuntos lista en http://localhost:${PORT}/api`);
  });
}

iniciar().catch((error) => {
  console.error("No se pudo iniciar el servidor.");
  console.error(error.message);
  process.exit(1);
});
