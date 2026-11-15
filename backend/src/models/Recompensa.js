const mongoose = require("mongoose");

const recompensaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "Escribe el nombre."],
      trim: true,
      minlength: [3, "Mínimo 3 caracteres."],
      maxlength: 40,
    },
    descripcion: {
      type: String,
      required: [true, "Escribe la descripción."],
      trim: true,
      minlength: [5, "Mínimo 5 caracteres."],
      maxlength: 80,
    },
    icono: { type: String, default: "🎁" },
    costo: { type: Number, required: true, min: [10, "El costo mínimo es 10."], max: 5000 },
    stock: { type: Number, required: true, min: [0, "Las unidades no pueden ser negativas."], max: 1000 },
    // Al "eliminar" una recompensa solo se desactiva, así los canjes antiguos la conservan
    activa: { type: Boolean, default: true },
  },
  { collection: "recompensas", timestamps: true }
);

module.exports = mongoose.model("Recompensa", recompensaSchema);
