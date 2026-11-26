import { useEffect, useState } from 'react'

// En el plan gratuito de Render el backend se apaga si no se usa y tarda
// hasta un minuto en despertar. Si una espera pasa de 5 segundos se avisa al usuario.
export function AvisoServidorLento({ activo, segundos = 5 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!activo) return
    const temporizador = setTimeout(() => setVisible(true), segundos * 1000)
    return () => {
      clearTimeout(temporizador)
      setVisible(false)
    }
  }, [activo, segundos])

  if (!activo || !visible) return null
  return (
    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
      ⏳ El servidor se está activando. La primera conexión puede tardar hasta un minuto.
    </p>
  )
}

// Indicador de carga mientras llegan los datos del backend
export default function Cargando({ texto = 'Cargando...', pantallaCompleta = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${pantallaCompleta ? 'min-h-screen px-4' : 'py-10'}`} role="status">
      <div className="flex items-center gap-3">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        {texto}
      </div>
      <AvisoServidorLento activo />
    </div>
  )
}

// Mensaje de error con botón para reintentar
export function MensajeError({ mensaje, onReintentar }) {
  return (
    <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200" role="alert">
      <p>{mensaje}</p>
      {onReintentar && (
        <button type="button" onClick={onReintentar} className="btn btn-secundario mt-3 px-3 py-1.5 text-xs">Reintentar</button>
      )}
    </div>
  )
}
