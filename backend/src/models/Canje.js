const mongoose = require("mongoose");

// Se copian nombre, icono y costo para conservar el historial aunque la recompensa cambie
const canjeSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    recompensa: { type: mongoose.Schema.Types.ObjectId, ref: "Recompensa", required: true },
    nombre: { type: String, required: true },
    icono: { type: String, default: "🎁" },
    costo: { type: Number, required: true },
    codigo: { type: String, required: true, unique: true },
    fecha: { type: Date, default: Date.now },
  },
  { collection: "canjes", timestamps: true }
);

module.exports = mongoose.model("Canje", canjeSchema);
