// Todas las rutas de la API bajo el prefijo /api
const express = require("express");
const { version } = require("../../package.json");
const { verificarToken, soloAdmin } = require("../middlewares/auth");
const auth = require("../controllers/authController");
const puntosAcopio = require("../controllers/puntosAcopioController");
const entregas = require("../controllers/entregasController");
const reportes = require("../controllers/reportesController");
const recompensas = require("../controllers/recompensasController");
const resumen = require("../controllers/resumenController");

const router = express.Router();

// Estado de la API
router.get("/", (req, res) => res.json({ mensaje: "API de EcoPuntos funcionando", version, entorno: process.env.NODE_ENV || "desarrollo" }));
router.get("/catalogos", resumen.obtenerCatalogos);

// Autenticación (públicas, excepto el perfil)
router.post("/auth/registro", auth.registrar);
router.post("/auth/login", auth.iniciarSesion);
router.get("/auth/perfil", verificarToken, auth.perfil);

// Desde aquí todas las rutas exigen sesión iniciada
router.use(verificarToken);

router.get("/resumen", resumen.obtener);

router.get("/puntos-acopio", puntosAcopio.listar);
router.post("/puntos-acopio", soloAdmin, puntosAcopio.crear);
router.delete("/puntos-acopio/:id", soloAdmin, puntosAcopio.eliminar);

router.get("/entregas", entregas.listarMias);
router.post("/entregas", entregas.crear);
router.delete("/entregas/:id", entregas.eliminar);

router.get("/reportes", reportes.listar);
router.post("/reportes", reportes.crear);
router.patch("/reportes/:id/estado", soloAdmin, reportes.cambiarEstado);
router.delete("/reportes/:id", reportes.eliminar);

router.get("/recompensas", recompensas.listar);
router.post("/recompensas", soloAdmin, recompensas.crear);
router.delete("/recompensas/:id", soloAdmin, recompensas.eliminar);
router.post("/recompensas/:id/canjear", recompensas.canjear);
router.get("/canjes", recompensas.misCanjes);

module.exports = router;
