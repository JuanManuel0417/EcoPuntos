/*
 * Carga los datos iniciales de EcoPuntos en MongoDB Atlas.
 * Uso: npm run seed
 * ATENCIÓN: borra y vuelve a crear todas las colecciones de la base "ecopuntos".
 */
require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const conectarBaseDeDatos = require("../config/database");
const Usuario = require("../models/Usuario");
const PuntoAcopio = require("../models/PuntoAcopio");
const Entrega = require("../models/Entrega");
const Reporte = require("../models/Reporte");
const Recompensa = require("../models/Recompensa");
const Canje = require("../models/Canje");
const { calcularPuntos } = require("../utils/puntos");

const diasAtras = (dias) => new Date(Date.now() - dias * 24 * 60 * 60 * 1000);

async function sembrar() {
  await conectarBaseDeDatos();

  await Promise.all([
    Usuario.deleteMany({}),
    PuntoAcopio.deleteMany({}),
    Entrega.deleteMany({}),
    Reporte.deleteMany({}),
    Recompensa.deleteMany({}),
    Canje.deleteMany({}),
  ]);

  // Cuentas de prueba (las contraseñas se cifran al guardar)
  const admin = await Usuario.create({ nombre: "Administrador EcoPuntos", correo: "admin@ecopuntos.co", password: "admin123", rol: "admin" });
  const juan = await Usuario.create({ nombre: "Juan Manuel González", correo: "juan@ecopuntos.co", password: "juan123" });

  const [pascual, robledo] = await PuntoAcopio.insertMany([
    { nombre: "Punto Verde I.U. Pascual Bravo", direccion: "Calle 73 # 73A-226, Robledo", horario: "Lun a Vie, 7:00 a.m. - 6:00 p.m.", materiales: ["plastico", "carton", "vidrio", "metal", "electronicos"] },
    { nombre: "Centro de Acopio Robledo", direccion: "Carrera 80 # 65-10, Robledo", horario: "Lun a Sáb, 8:00 a.m. - 5:00 p.m.", materiales: ["plastico", "carton", "vidrio", "metal"] },
    { nombre: "EcoEstación Parque Central", direccion: "Calle 50 # 45-20, Centro", horario: "Todos los días, 9:00 a.m. - 7:00 p.m.", materiales: ["plastico", "carton", "metal"] },
    { nombre: "Punto RAEE Belén", direccion: "Carrera 76 # 30-15, Belén", horario: "Mar a Sáb, 9:00 a.m. - 4:00 p.m.", materiales: ["electronicos", "metal"] },
  ]);

  const entrega = (material, kg, punto, dias, observaciones = "") => ({
    usuario: juan._id, material, kg, puntoAcopio: punto._id, puntos: calcularPuntos(material, kg), observaciones, fecha: diasAtras(dias),
  });
  await Entrega.insertMany([
    entrega("plastico", 4.5, pascual, 20, "Botellas PET limpias"),
    entrega("carton", 8, robledo, 12),
    entrega("metal", 2, pascual, 4, "Latas de aluminio"),
  ]);

  await Reporte.insertMany([
    {
      usuario: juan._id, categoria: "basuras", titulo: "Basuras acumuladas en la esquina del parque",
      ubicacion: "Carrera 80 con Calle 70, Robledo",
      descripcion: "Hace más de una semana hay bolsas de basura acumuladas junto al parque infantil. Hay malos olores y presencia de roedores.",
      estado: "en_proceso", fecha: diasAtras(15),
    },
    {
      usuario: juan._id, categoria: "vertimiento", titulo: "Agua con espuma en la quebrada",
      ubicacion: "Quebrada La Iguaná, sector puente peatonal",
      descripcion: "Se observa espuma blanca y mal olor en el agua de la quebrada, posiblemente por vertimientos de alguna empresa cercana.",
      estado: "pendiente", fecha: diasAtras(2),
    },
  ]);

  await Recompensa.insertMany([
    { nombre: "Café gratis", descripcion: "Un café en la cafetería del campus.", icono: "☕", costo: 50, stock: 20 },
    { nombre: "Bolsa de tela ecológica", descripcion: "Bolsa reutilizable para tus compras.", icono: "👜", costo: 80, stock: 15 },
    { nombre: "Kit de semillas", descripcion: "Semillas para iniciar tu huerta en casa.", icono: "🌱", costo: 120, stock: 12 },
    { nombre: "Botella reutilizable", descripcion: "Botella de acero inoxidable de 750 ml.", icono: "🥤", costo: 150, stock: 10 },
    { nombre: "20% de descuento", descripcion: "Bono de descuento en una tienda aliada.", icono: "🏷️", costo: 200, stock: 8 },
    { nombre: "Entrada a cine", descripcion: "Una entrada para cualquier función 2D.", icono: "🎬", costo: 300, stock: 5 },
  ]);

  // Crea los índices definidos en los modelos (por ejemplo, correo único)
  await Promise.all([Usuario, Canje].map((modelo) => modelo.syncIndexes()));

  console.log("Datos iniciales cargados:");
  console.log(`  Usuarios: ${admin.correo} (admin) y ${juan.correo} (ciudadano)`);
  console.log("  4 puntos de acopio, 3 entregas, 2 reportes y 6 recompensas.");
}

sembrar()
  .catch((error) => {
    console.error("No se pudieron cargar los datos:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
