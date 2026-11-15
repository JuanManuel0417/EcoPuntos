const mongoose = require("mongoose");
const { IDS_MATERIALES } = require("../config/catalogos");

const puntoAcopioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El nombre es obligatorio."], trim: true },
    direccion: { type: String, required: [true, "La dirección es obligatoria."], trim: true },
    horario: { type: String, required: [true, "El horario es obligatorio."], trim: true },
    materiales: {
      type: [{ type: String, enum: IDS_MATERIALES }],
      validate: [(lista) => lista.length > 0, "El punto debe recibir al menos un material."],
    },
    activo: { type: Boolean, default: true },
  },
  { collection: "puntos_acopio", timestamps: true }
);

module.exports = mongoose.model("PuntoAcopio", puntoAcopioSchema);
