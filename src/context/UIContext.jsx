// Contexto de interfaz: notificaciones (toasts) y ventana de confirmación
// que cualquier página puede usar con useUI().
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const UIContext = createContext(null)

const ESTILOS_TOAST = {
  exito: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-slate-800',
}

function DialogoConfirmacion({ datos, onResponder }) {
  const dialogo = useRef(null)

  useEffect(() => {
    if (datos && !dialogo.current.open) dialogo.current.showModal()
  }, [datos])

  if (!datos) return null
  return (
    <dialog
      ref={dialogo}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 shadow-xl"
      onClose={(e) => onResponder(e.currentTarget.returnValue === 'si')}
    >
      <form method="dialog" className="p-6">
        <h2 className="text-lg font-bold text-slate-800">{datos.titulo}</h2>
        <p className="mt-2 text-slate-600">{datos.mensaje}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button value="no" className="btn btn-secundario">Cancelar</button>
          <button value="si" className={`btn ${datos.peligro ? 'btn-peligro' : 'btn-primario'}`}>
            {datos.textoAceptar || 'Aceptar'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmacion, setConfirmacion] = useState(null)

  const notificar = useCallback((mensaje, tipo = 'exito') => {
    const id = Date.now() + Math.random()
    setToasts((lista) => [...lista, { id, mensaje, tipo }])
    setTimeout(() => setToasts((lista) => lista.filter((t) => t.id !== id)), 3500)
  }, [])

  // Devuelve una promesa que se resuelve con true (aceptar) o false (cancelar)
  const confirmar = useCallback(
    (opciones) => new Promise((resolver) => setConfirmacion({ ...opciones, resolver })),
    [],
  )

  const responder = (respuesta) => {
    confirmacion?.resolver(respuesta)
    setConfirmacion(null)
  }

  return (
    <UIContext.Provider value={{ notificar, confirmar }}>
      {children}

      <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${ESTILOS_TOAST[t.tipo] || ESTILOS_TOAST.info} rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg`}>
            {t.mensaje}
          </div>
        ))}
      </div>

      <DialogoConfirmacion datos={confirmacion} onResponder={responder} />
    </UIContext.Provider>
  )
}

export function useUI() {
  const contexto = useContext(UIContext)
  if (!contexto) throw new Error('useUI debe usarse dentro de <UIProvider>')
  return contexto
}
