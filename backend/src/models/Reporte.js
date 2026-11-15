const mongoose = require("mongoose");
const { CATEGORIAS_REPORTE, ESTADOS_REPORTE } = require("../config/catalogos");

const reporteSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    categoria: {
      type: String,
      required: [true, "Elige una categoría."],
      enum: { values: CATEGORIAS_REPORTE, message: "Categoría no válida." },
    },
    titulo: {
      type: String,
      required: [true, "Escribe un título."],
      trim: true,
      minlength: [5, "El título debe tener al menos 5 caracteres."],
      maxlength: 80,
    },
    ubicacion: {
      type: String,
      required: [true, "Indica la ubicación."],
      trim: true,
      minlength: [5, "Indica una ubicación más precisa."],
      maxlength: 120,
    },
    descripcion: {
      type: String,
      required: [true, "Describe el problema."],
      trim: true,
      minlength: [20, "Describe el problema con al menos 20 caracteres."],
      maxlength: 500,
    },
    // Foto reducida en formato data URL (JPG). Es opcional.
    foto: { type: String, default: "" },
    estado: { type: String, enum: ESTADOS_REPORTE, default: "pendiente" },
    fecha: { type: Date, default: Date.now },
  },
  { collection: "reportes", timestamps: true }
);

module.exports = mongoose.model("Reporte", reporteSchema);
