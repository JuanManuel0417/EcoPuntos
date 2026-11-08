// Servicio de datos: simula la base de datos con el LocalStorage del navegador.
// En el Laboratorio III estas funciones se reemplazarán por peticiones a la API de Node + MongoDB.
import {
  ESTADOS_CON_PUNTOS, ESTADOS_REPORTE, NIVELES, PUNTOS_POR_REPORTE, material,
} from './catalogos'
import { datosIniciales } from './semilla'

// Clave distinta a la del prototipo para que ambos proyectos no se mezclen
const CLAVE_BD = 'ecopuntos_react_bd'
const VERSION_BD = 1

let bd = null

function cargar() {
  if (bd) return bd
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_BD))
    if (guardada?.version === VERSION_BD) {
      bd = guardada
    } else {
      bd = datosIniciales(VERSION_BD)
      guardar()
    }
  } catch {
    bd = datosIniciales(VERSION_BD)
  }
  return bd
}

function guardar() {
  try {
    localStorage.setItem(CLAVE_BD, JSON.stringify(bd))
    return true
  } catch (error) {
    // Normalmente ocurre cuando se supera el espacio del LocalStorage (fotos grandes)
    console.error('No se pudo guardar en LocalStorage:', error)
    return false
  }
}

export function reiniciarDatos() {
  bd = datosIniciales(VERSION_BD)
  guardar()
}

const nuevoId = (prefijo) => prefijo + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const porFechaDesc = (a, b) => b.fecha.localeCompare(a.fecha)

/* ---------- Cálculos ---------- */

export function calcularPuntos(materialId, kg) {
  const m = material(materialId)
  return m && kg > 0 ? Math.round(m.puntosPorKg * kg) : 0
}

export function calcularCo2(materialId, kg) {
  const m = material(materialId)
  return m && kg > 0 ? m.co2PorKg * kg : 0
}

export const puntosDeReporte = (reporte) =>
  ESTADOS_CON_PUNTOS.includes(reporte.estado) ? PUNTOS_POR_REPORTE : 0

// El saldo se calcula siempre a partir de los movimientos, así nunca queda desfasado
export function resumenUsuario(usuarioId) {
  const { entregas, reportes, canjes } = cargar()
  const misEntregas = entregas.filter((e) => e.usuarioId === usuarioId)
  const misReportes = reportes.filter((r) => r.usuarioId === usuarioId)
  const misCanjes = canjes.filter((c) => c.usuarioId === usuarioId)

  const ganados = misEntregas.reduce((t, e) => t + e.puntos, 0) +
    misReportes.reduce((t, r) => t + puntosDeReporte(r), 0)
  const gastados = misCanjes.reduce((t, c) => t + c.costo, 0)

  let indice = 0
  NIVELES.forEach((nivel, i) => { if (ganados >= nivel.minimo) indice = i })
  const nivel = NIVELES[indice]
  const siguienteNivel = NIVELES[indice + 1] || null
  const progreso = siguienteNivel
    ? Math.round(((ganados - nivel.minimo) / (siguienteNivel.minimo - nivel.minimo)) * 100)
    : 100

  return {
    saldo: ganados - gastados,
    ganados,
    gastados,
    kg: misEntregas.reduce((t, e) => t + e.kg, 0),
    co2: misEntregas.reduce((t, e) => t + calcularCo2(e.materialId, e.kg), 0),
    totalEntregas: misEntregas.length,
    totalReportes: misReportes.length,
    reportesValidados: misReportes.filter((r) => ESTADOS_CON_PUNTOS.includes(r.estado)).length,
    nivel,
    siguienteNivel,
    progreso,
  }
}

/* ---------- Usuarios ---------- */

export const usuarios = {
  porId: (id) => cargar().usuarios.find((u) => u.id === id) || null,
  porCorreo: (correo) => cargar().usuarios.find((u) => u.correo === correo.trim().toLowerCase()) || null,
  crear({ nombre, correo, password }) {
    const usuario = {
      id: nuevoId('u'),
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      password,
      rol: 'ciudadano',
      creado: new Date().toISOString(),
    }
    cargar().usuarios.push(usuario)
    guardar()
    return usuario
  },
}

/* ---------- Entregas de reciclaje ---------- */

export const entregas = {
  deUsuario: (usuarioId) => cargar().entregas.filter((e) => e.usuarioId === usuarioId).sort(porFechaDesc),

  crear({ usuarioId, materialId, kg, puntoId, fecha, observaciones }) {
    const entrega = {
      id: nuevoId('e'),
      usuarioId,
      materialId,
      kg,
      puntoId,
      puntos: calcularPuntos(materialId, kg),
      observaciones: observaciones.trim(),
      fecha,
    }
    cargar().entregas.push(entrega)
    if (guardar()) return entrega
    cargar().entregas.pop()
    return null
  },

  eliminar(id, usuarioId) {
    const datos = cargar()
    const entrega = datos.entregas.find((e) => e.id === id && e.usuarioId === usuarioId)
    if (!entrega) return { ok: false, error: 'La entrega no existe.' }
    // No se permite borrar una entrega cuyos puntos ya se gastaron en canjes
    if (resumenUsuario(usuarioId).saldo - entrega.puntos < 0) {
      return { ok: false, error: 'No puedes eliminar esta entrega: sus puntos ya fueron usados en canjes.' }
    }
    datos.entregas = datos.entregas.filter((e) => e.id !== id)
    guardar()
    return { ok: true }
  },
}

/* ---------- Reportes ambientales ---------- */

export const reportes = {
  todos: () => [...cargar().reportes].sort(porFechaDesc),

  crear({ usuarioId, categoriaId, titulo, ubicacion, descripcion, foto }) {
    const reporte = {
      id: nuevoId('r'),
      usuarioId,
      categoriaId,
      titulo: titulo.trim(),
      ubicacion: ubicacion.trim(),
      descripcion: descripcion.trim(),
      foto: foto || '',
      estado: 'pendiente',
      fecha: new Date().toISOString(),
    }
    cargar().reportes.push(reporte)
    if (guardar()) return reporte
    // Si no cabe (por la foto), se deshace el cambio
    cargar().reportes.pop()
    return null
  },

  cambiarEstado(id, estado) {
    const reporte = cargar().reportes.find((r) => r.id === id)
    if (!reporte || !ESTADOS_REPORTE[estado]) return { ok: false, error: 'Reporte o estado no válido.' }
    // Si al quitar los puntos el ciudadano quedaría con saldo negativo, no se permite
    if (puntosDeReporte(reporte) > 0 && !ESTADOS_CON_PUNTOS.includes(estado) &&
        resumenUsuario(reporte.usuarioId).saldo - PUNTOS_POR_REPORTE < 0) {
      return { ok: false, error: 'El ciudadano ya gastó los puntos de este reporte.' }
    }
    reporte.estado = estado
    guardar()
    return { ok: true }
  },

  eliminar(id, usuarioId) {
    const datos = cargar()
    const reporte = datos.reportes.find((r) => r.id === id && r.usuarioId === usuarioId)
    if (!reporte) return { ok: false, error: 'El reporte no existe.' }
    if (reporte.estado !== 'pendiente') return { ok: false, error: 'Solo puedes eliminar reportes pendientes.' }
    datos.reportes = datos.reportes.filter((r) => r.id !== id)
    guardar()
    return { ok: true }
  },
}

/* ---------- Recompensas y canjes ---------- */

export const recompensas = {
  todas: () => [...cargar().recompensas].sort((a, b) => a.costo - b.costo),

  crear({ nombre, descripcion, icono, costo, stock }) {
    const recompensa = { id: nuevoId('p'), nombre: nombre.trim(), descripcion: descripcion.trim(), icono, costo, stock }
    cargar().recompensas.push(recompensa)
    guardar()
    return recompensa
  },

  eliminar(id) {
    const datos = cargar()
    datos.recompensas = datos.recompensas.filter((p) => p.id !== id)
    guardar()
  },

  canjear(recompensaId, usuarioId) {
    const recompensa = cargar().recompensas.find((p) => p.id === recompensaId)
    if (!recompensa) return { ok: false, error: 'La recompensa no existe.' }
    if (recompensa.stock <= 0) return { ok: false, error: 'Esta recompensa está agotada.' }
    if (resumenUsuario(usuarioId).saldo < recompensa.costo) return { ok: false, error: 'No tienes puntos suficientes.' }
    const canje = {
      id: nuevoId('c'),
      usuarioId,
      recompensaId,
      nombre: recompensa.nombre,
      icono: recompensa.icono,
      costo: recompensa.costo,
      codigo: 'ECO-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      fecha: new Date().toISOString(),
    }
    recompensa.stock -= 1
    cargar().canjes.push(canje)
    guardar()
    return { ok: true, canje }
  },

  canjesDeUsuario: (usuarioId) => cargar().canjes.filter((c) => c.usuarioId === usuarioId).sort(porFechaDesc),
}
