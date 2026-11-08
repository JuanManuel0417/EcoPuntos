// Contexto de autenticación: guarda el usuario de la sesión y permite
// que cualquier componente sepa quién está conectado y cuántos puntos tiene.
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { resumenUsuario, usuarios } from '../data/db'

const CLAVE_SESION = 'ecopuntos_react_sesion'
const AuthContext = createContext(null)

function leerSesion() {
  try {
    return localStorage.getItem(CLAVE_SESION)
  } catch {
    return null
  }
}

function escribirSesion(usuarioId) {
  try {
    if (usuarioId) localStorage.setItem(CLAVE_SESION, usuarioId)
    else localStorage.removeItem(CLAVE_SESION)
  } catch {
    /* Sin LocalStorage la sesión no se puede recordar */
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const id = leerSesion()
    return id ? usuarios.porId(id) : null
  })
  // Cada vez que cambian los datos se incrementa la versión para recalcular el resumen
  const [version, setVersion] = useState(0)
  const refrescar = useCallback(() => setVersion((v) => v + 1), [])

  const iniciarSesion = useCallback((correo, password) => {
    const encontrado = usuarios.porCorreo(correo)
    if (!encontrado || encontrado.password !== password) {
      return { ok: false, error: 'Correo o contraseña incorrectos.' }
    }
    escribirSesion(encontrado.id)
    setUsuario(encontrado)
    return { ok: true }
  }, [])

  const registrar = useCallback(({ nombre, correo, password }) => {
    if (usuarios.porCorreo(correo)) return { ok: false, error: 'Ya existe una cuenta con ese correo.' }
    const nuevo = usuarios.crear({ nombre, correo, password })
    escribirSesion(nuevo.id)
    setUsuario(nuevo)
    return { ok: true }
  }, [])

  const cerrarSesion = useCallback(() => {
    escribirSesion(null)
    setUsuario(null)
  }, [])

  const resumen = useMemo(() => (usuario ? resumenUsuario(usuario.id) : null), [usuario, version])

  const valor = {
    usuario,
    esAdmin: usuario?.rol === 'admin',
    resumen,
    version,
    refrescar,
    iniciarSesion,
    registrar,
    cerrarSesion,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
