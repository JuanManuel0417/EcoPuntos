// Cliente de la API REST del backend (Node.js + Express + MongoDB)
const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const CLAVE_TOKEN = 'ecopuntos_token'

// El token JWT se guarda en el navegador para mantener la sesión al recargar
export const token = {
  leer() {
    try {
      return localStorage.getItem(CLAVE_TOKEN)
    } catch {
      return null
    }
  },
  guardar(valor) {
    try {
      localStorage.setItem(CLAVE_TOKEN, valor)
    } catch {
      /* Sin LocalStorage la sesión dura hasta recargar la página */
    }
  },
  borrar() {
    try {
      localStorage.removeItem(CLAVE_TOKEN)
    } catch {
      /* nada que borrar */
    }
  },
}

export class ErrorApi extends Error {
  constructor(status, mensaje, errores = {}) {
    super(mensaje)
    this.status = status
    this.errores = errores
  }
}

async function peticion(metodo, ruta, cuerpo) {
  const encabezados = { 'Content-Type': 'application/json' }
  const jwt = token.leer()
  if (jwt) encabezados.Authorization = `Bearer ${jwt}`

  let respuesta
  try {
    respuesta = await fetch(URL_API + ruta, {
      method: metodo,
      headers: encabezados,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Verifica que el backend esté encendido.')
  }

  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    // Si el token venció, se avisa a la aplicación para cerrar la sesión
    if (respuesta.status === 401 && jwt) window.dispatchEvent(new Event('ecopuntos:sesion-expirada'))
    throw new ErrorApi(respuesta.status, datos.error || 'Ocurrió un error inesperado.', datos.errores)
  }
  return datos
}

const get = (ruta) => peticion('GET', ruta)
const post = (ruta, cuerpo) => peticion('POST', ruta, cuerpo ?? {})
const patch = (ruta, cuerpo) => peticion('PATCH', ruta, cuerpo)
const del = (ruta) => peticion('DELETE', ruta)

export const api = {
  auth: {
    login: (correo, password) => post('/auth/login', { correo, password }),
    registro: (datos) => post('/auth/registro', datos),
    perfil: () => get('/auth/perfil'),
  },
  resumen: () => get('/resumen'),
  puntosAcopio: {
    listar: () => get('/puntos-acopio'),
  },
  entregas: {
    listar: () => get('/entregas'),
    crear: (datos) => post('/entregas', datos),
    eliminar: (id) => del(`/entregas/${id}`),
  },
  reportes: {
    listar: () => get('/reportes'),
    crear: (datos) => post('/reportes', datos),
    cambiarEstado: (id, estado) => patch(`/reportes/${id}/estado`, { estado }),
    eliminar: (id) => del(`/reportes/${id}`),
  },
  recompensas: {
    listar: () => get('/recompensas'),
    crear: (datos) => post('/recompensas', datos),
    eliminar: (id) => del(`/recompensas/${id}`),
    canjear: (id) => post(`/recompensas/${id}/canjear`),
  },
  canjes: {
    listar: () => get('/canjes'),
  },
}
