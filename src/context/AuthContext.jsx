// Contexto de autenticación: guarda el usuario de la sesión (JWT) y el resumen
// de puntos que entrega el backend, para que cualquier componente pueda usarlos.
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, token } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  // Mientras se valida el token guardado no se decide si mostrar el login o la app
  const [cargando, setCargando] = useState(() => !!token.leer())
  // { resumen, actividad, reportesPendientes } que devuelve GET /api/resumen
  const [panel, setPanel] = useState(null)

  const refrescar = useCallback(async () => {
    try {
      setPanel(await api.resumen())
    } catch {
      /* Si falla, se conserva el último resumen conocido */
    }
  }, [])

  const abrirSesion = useCallback(
    async ({ token: jwt, usuario: datosUsuario }) => {
      token.guardar(jwt)
      setUsuario(datosUsuario)
      await refrescar()
    },
    [refrescar],
  )

  const cerrarSesion = useCallback(() => {
    token.borrar()
    setUsuario(null)
    setPanel(null)
  }, [])

  // Al abrir la aplicación, si hay un token guardado se recupera el perfil
  useEffect(() => {
    if (!token.leer()) return
    api.auth
      .perfil()
      .then(async ({ usuario: datosUsuario }) => {
        setUsuario(datosUsuario)
        await refrescar()
      })
      .catch(() => token.borrar())
      .finally(() => setCargando(false))
  }, [refrescar])

  // Si el backend responde 401 (token vencido), se cierra la sesión
  useEffect(() => {
    window.addEventListener('ecopuntos:sesion-expirada', cerrarSesion)
    return () => window.removeEventListener('ecopuntos:sesion-expirada', cerrarSesion)
  }, [cerrarSesion])

  const iniciarSesion = useCallback(
    async (correo, password) => abrirSesion(await api.auth.login(correo, password)),
    [abrirSesion],
  )

  const registrar = useCallback(
    async ({ nombre, correo, password }) => abrirSesion(await api.auth.registro({ nombre, correo, password })),
    [abrirSesion],
  )

  const valor = {
    usuario,
    cargando,
    esAdmin: usuario?.rol === 'admin',
    resumen: panel?.resumen ?? null,
    actividad: panel?.actividad ?? [],
    reportesPendientes: panel?.reportesPendientes ?? 0,
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
