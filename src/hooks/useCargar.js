// Hook para cargar datos de la API con estado de carga, error y recarga
import { useCallback, useEffect, useState } from 'react'

export function useCargar(funcion, valorInicial = []) {
  const [datos, setDatos] = useState(valorInicial)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(async () => {
    try {
      setError('')
      setDatos(await funcion())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
    // La función se define una sola vez por página (por ejemplo api.entregas.listar)
  }, [funcion])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { datos, setDatos, cargando, error, recargar }
}
