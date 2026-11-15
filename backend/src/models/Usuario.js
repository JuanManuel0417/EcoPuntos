const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio."],
      trim: true,
      minlength: [3, "El nombre debe tener al menos 3 letras."],
      maxlength: 60,
    },
    correo: {
      type: String,
      required: [true, "El correo es obligatorio."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "El correo no tiene un formato válido."],
    },
    // La contraseña se guarda cifrada y no se devuelve en las consultas
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria."],
      select: false,
    },
    rol: {
      type: String,
      enum: ["ciudadano", "admin"],
      default: "ciudadano",
    },
  },
  { collection: "usuarios", timestamps: true }
);

// Antes de guardar, cifra la contraseña si cambió
usuarioSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

usuarioSchema.methods.compararPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Datos públicos del usuario (sin contraseña)
usuarioSchema.methods.aPublico = function () {
  return { id: this._id.toString(), nombre: this.nombre, correo: this.correo, rol: this.rol };
};

module.exports = mongoose.model("Usuario", usuarioSchema);
