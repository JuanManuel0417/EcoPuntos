// Envoltura de un campo de formulario: etiqueta, control y mensaje de error.
// El control (input, select, textarea) se pasa como hijo.
export default function Campo({ id, etiqueta, opcional = false, error, children, className = '' }) {
  return (
    <div className={className}>
      {etiqueta && (
        <label htmlFor={id} className="etiqueta">
          {etiqueta} {opcional && <span className="font-normal text-slate-400">(opcional)</span>}
        </label>
      )}
      {children}
      {error && (
        <p id={`error-${id}`} className="mensaje-error visible">
          {error}
        </p>
      )}
    </div>
  )
}
