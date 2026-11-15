// Indicador de carga mientras llegan los datos del backend
export default function Cargando({ texto = 'Cargando...', pantallaCompleta = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-slate-500 ${pantallaCompleta ? 'min-h-screen' : 'py-10'}`} role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      {texto}
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
