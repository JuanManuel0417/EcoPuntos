// Conexión con MongoDB Atlas usando Mongoose
const mongoose = require("mongoose");

async function conectarBaseDeDatos() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Falta MONGODB_URI. Copia .env-example como .env y pega la URL de MongoDB Atlas.");
  }

  await mongoose.connect(uri);
  console.log("Conectado a MongoDB. Base de datos:", mongoose.connection.name);
}

module.exports = conectarBaseDeDatos;
