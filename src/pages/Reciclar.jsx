import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { MATERIALES, material, puntoAcopio, puntosAcopioPara } from '../data/catalogos'
import { calcularCo2, calcularPuntos, entregas } from '../data/db'
import Campo from '../components/Campo'
import { claseCampo } from '../utils/estilos'
import { fecha, hoyISO, numero } from '../utils/formato'
import { validar } from '../utils/validaciones'

const valoresIniciales = () => ({ materialId: '', kg: '', fecha: hoyISO(), puntoId: '', observaciones: '' })

function FormularioEntrega({ onRegistrada }) {
  const { usuario } = useAuth()
  const { notificar } = useUI()
  const [valores, setValores] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})

  const puntosDisponibles = valores.materialId ? puntosAcopioPara(valores.materialId) : []
  const kg = parseFloat(valores.kg)
  const punto = puntoAcopio(valores.puntoId)

  const cambiar = (campo) => (e) => {
    const nuevos = { ...valores, [campo]: e.target.value }
    // Si el punto elegido no recibe el nuevo material, se limpia
    if (campo === 'materialId' && !puntosAcopioPara(e.target.value).some((p) => p.id === valores.puntoId)) {
      nuevos.puntoId = ''
    }
    setValores(nuevos)
    setErrores({ ...errores, [campo]: '' })
  }

  const limpiar = () => {
    setValores(valoresIniciales())
    setErrores({})
  }

  const enviar = (e) => {
    e.preventDefault()
    const nuevosErrores = validar(valores, {
      materialId: (v) => (v ? '' : 'Elige el tipo de material.'),
      kg: (v) => {
        if (!v) return 'Escribe el peso en kilogramos.'
        if (!(Number(v) >= 0.1)) return 'El peso mínimo es 0,1 kg.'
        return Number(v) > 500 ? 'El peso máximo por entrega es 500 kg.' : ''
      },
      fecha: (v) => {
        if (!v) return 'Elige la fecha de la entrega.'
        return v > hoyISO() ? 'La fecha no puede ser futura.' : ''
      },
      puntoId: (v, todos) => (v || !todos.materialId ? '' : 'Elige el punto de acopio.'),
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) return

    const entrega = entregas.crear({
      usuarioId: usuario.id,
      materialId: valores.materialId,
      kg: Math.round(Number(valores.kg) * 10) / 10,
      puntoId: valores.puntoId,
      // Se guarda al mediodía para evitar cambios de día por la zona horaria
      fecha: new Date(valores.fecha + 'T12:00:00').toISOString(),
      observaciones: valores.observaciones,
    })
    if (!entrega) return notificar('No se pudo guardar la entrega. Intenta de nuevo.', 'error')

    notificar(`¡Entrega registrada! Ganaste ${entrega.puntos} puntos 🎉`)
    limpiar()
    onRegistrada()
  }

  return (
    <form onSubmit={enviar} onReset={limpiar} className="space-y-5" noValidate>
      <fieldset>
        <legend className="etiqueta">1. ¿Qué material entregaste?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MATERIALES.map((m) => (
            <label key={m.id} className="cursor-pointer">
              <input type="radio" name="material" value={m.id} className="peer sr-only"
                     checked={valores.materialId === m.id} onChange={cambiar('materialId')} />
              <span className="flex flex-col items-center gap-1 rounded-xl border-2 border-slate-200 p-3 text-center transition hover:border-emerald-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-300">
                <span className="text-3xl">{m.icono}</span>
                <span className="text-sm font-semibold text-slate-700">{m.nombre}</span>
                <span className="text-xs text-emerald-700">{m.puntosPorKg} pts/kg</span>
              </span>
            </label>
          ))}
        </div>
        {errores.materialId && <p className="mensaje-error visible">{errores.materialId}</p>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="entrega-kg" etiqueta="2. Peso (kg)" error={errores.kg}>
          <input id="entrega-kg" type="number" min="0.1" max="500" step="0.1" inputMode="decimal" placeholder="Ej: 2.5"
                 className={claseCampo(errores.kg)} value={valores.kg} onChange={cambiar('kg')} />
        </Campo>
        <Campo id="entrega-fecha" etiqueta="3. Fecha de la entrega" error={errores.fecha}>
          <input id="entrega-fecha" type="date" max={hoyISO()} className={claseCampo(errores.fecha)}
                 value={valores.fecha} onChange={cambiar('fecha')} />
        </Campo>
      </div>

      <Campo id="entrega-punto" etiqueta="4. Punto de acopio" error={errores.puntoId}>
        <select id="entrega-punto" className={claseCampo(errores.puntoId)} disabled={!valores.materialId}
                value={valores.puntoId} onChange={cambiar('puntoId')}>
          <option value="">{valores.materialId ? 'Selecciona un punto de acopio' : 'Primero elige un material'}</option>
          {puntosDisponibles.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        {punto && <p className="mt-1 text-xs text-slate-500">📌 {punto.direccion} · 🕒 {punto.horario}</p>}
      </Campo>

      <Campo id="entrega-observaciones" etiqueta="Observaciones" opcional>
        <textarea id="entrega-observaciones" rows="2" maxLength={200} className="campo" placeholder="Ej: botellas lavadas y aplastadas"
                  value={valores.observaciones} onChange={cambiar('observaciones')} />
      </Campo>

      {/* Vista previa del cálculo */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4" aria-live="polite">
        <div>
          <p className="text-sm text-emerald-800">Puntos que ganarás</p>
          <p className="text-3xl font-extrabold text-emerald-700">{numero(calcularPuntos(valores.materialId, kg))} pts</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-emerald-800">CO₂ evitado aprox.</p>
          <p className="text-xl font-bold text-emerald-700">{numero(calcularCo2(valores.materialId, kg))} kg</p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="reset" className="btn btn-secundario">Limpiar</button>
        <button type="submit" className="btn btn-primario">Registrar entrega</button>
      </div>
    </form>
  )
}

export default function Reciclar() {
  const { usuario, version, refrescar } = useAuth()
  const { notificar, confirmar } = useUI()

  const historial = useMemo(() => entregas.deUsuario(usuario.id), [usuario.id, version])
  const totalKg = historial.reduce((t, e) => t + e.kg, 0)
  const kgPorMaterial = MATERIALES.map((m) => ({
    ...m,
    kg: historial.filter((e) => e.materialId === m.id).reduce((t, e) => t + e.kg, 0),
  }))
  const maximo = Math.max(...kgPorMaterial.map((m) => m.kg), 1)

  const eliminar = async (id) => {
    const aceptar = await confirmar({
      titulo: '¿Eliminar entrega?',
      mensaje: 'Se descontarán los puntos que ganaste con esta entrega.',
      textoAceptar: 'Eliminar',
      peligro: true,
    })
    if (!aceptar) return
    const resultado = entregas.eliminar(id, usuario.id)
    notificar(resultado.ok ? 'Entrega eliminada.' : resultado.error, resultado.ok ? 'info' : 'error')
    refrescar()
  }

  return (
    <>
      <section>
        <h1 className="titulo-pagina">♻️ Registrar entrega de reciclaje</h1>
        <p className="text-slate-500">Registra el material que entregaste en un punto de acopio y gana puntos según su peso.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="tarjeta lg:col-span-2">
          <FormularioEntrega onRegistrada={refrescar} />
        </section>

        <aside className="space-y-6">
          <article className="tarjeta">
            <h2 className="font-bold text-slate-700">Tabla de puntos</h2>
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {MATERIALES.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2">
                  <span>{m.icono} {m.nombre}</span>
                  <span className="font-semibold text-emerald-700">{m.puntosPorKg} pts/kg</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="tarjeta">
            <h2 className="font-bold text-slate-700">Tu reciclaje por material</h2>
            <div className="mt-4 space-y-3">
              {kgPorMaterial.map((m) => (
                <div key={m.id}>
                  <div className="flex justify-between text-sm">
                    <span>{m.icono} {m.nombre}</span>
                    <span className="font-semibold text-slate-600">{numero(m.kg)} kg</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(m.kg / maximo) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>

      <section className="tarjeta">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-700">Historial de entregas</h2>
          <span className="text-sm text-slate-500">{historial.length} entregas · {numero(totalKg)} kg</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Material</th>
                <th className="py-2 pr-3 text-right">Peso</th>
                <th className="py-2 pr-3">Punto de acopio</th>
                <th className="py-2 pr-3 text-right">Puntos</th>
                <th className="py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historial.length === 0 && (
                <tr><td colSpan="6" className="py-10 text-center text-slate-400">Todavía no has registrado entregas.</td></tr>
              )}
              {historial.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap py-3 pr-3">{fecha(e.fecha)}</td>
                  <td className="py-3 pr-3">{material(e.materialId).icono} {material(e.materialId).nombre}</td>
                  <td className="py-3 pr-3 text-right">{numero(e.kg)} kg</td>
                  <td className="py-3 pr-3">{puntoAcopio(e.puntoId)?.nombre || '—'}</td>
                  <td className="py-3 pr-3 text-right font-bold text-emerald-600">+{e.puntos}</td>
                  <td className="py-3 text-right">
                    <button type="button" onClick={() => eliminar(e.id)} className="btn btn-secundario px-2 py-1 text-xs text-rose-600">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
