const mongoose = require("mongoose");
const { IDS_MATERIALES } = require("../config/catalogos");

const entregaSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    material: {
      type: String,
      required: [true, "Elige el tipo de material."],
      enum: { values: IDS_MATERIALES, message: "Material no válido." },
    },
    kg: {
      type: Number,
      required: [true, "Escribe el peso en kilogramos."],
      min: [0.1, "El peso mínimo es 0,1 kg."],
      max: [500, "El peso máximo por entrega es 500 kg."],
    },
    puntoAcopio: { type: mongoose.Schema.Types.ObjectId, ref: "PuntoAcopio", required: [true, "Elige el punto de acopio."] },
    puntos: { type: Number, required: true, min: 0 },
    observaciones: { type: String, trim: true, maxlength: 200, default: "" },
    fecha: { type: Date, required: [true, "Elige la fecha de la entrega."] },
  },
  { collection: "entregas", timestamps: true }
);

module.exports = mongoose.model("Entrega", entregaSchema);
