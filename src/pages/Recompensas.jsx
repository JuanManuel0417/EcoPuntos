import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { ICONOS_RECOMPENSA } from '../data/catalogos'
import { recompensas } from '../data/db'
import Campo from '../components/Campo'
import { claseCampo } from '../utils/estilos'
import { fecha, numero } from '../utils/formato'
import { validar, validarEntero } from '../utils/validaciones'

const valoresIniciales = { nombre: '', descripcion: '', icono: ICONOS_RECOMPENSA[0], costo: '', stock: '' }

// Formulario solo visible para el administrador
function FormularioRecompensa({ onCreada }) {
  const { notificar } = useUI()
  const [valores, setValores] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})

  const cambiar = (campo) => (e) => {
    setValores({ ...valores, [campo]: e.target.value })
    setErrores({ ...errores, [campo]: '' })
  }

  const enviar = (e) => {
    e.preventDefault()
    const nuevosErrores = validar(valores, {
      nombre: (v) => (v.length >= 3 ? '' : 'Mínimo 3 caracteres.'),
      descripcion: (v) => (v.length >= 5 ? '' : 'Mínimo 5 caracteres.'),
      costo: (v) => validarEntero(v, 10, 5000, 'el costo'),
      stock: (v) => validarEntero(v, 1, 1000, 'las unidades'),
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) return

    recompensas.crear({ ...valores, costo: Number(valores.costo), stock: Number(valores.stock) })
    notificar('Recompensa agregada al catálogo.')
    setValores(valoresIniciales)
    onCreada()
  }

  return (
    <section className="tarjeta">
      <h2 className="text-lg font-bold text-slate-700">
        Agregar recompensa <span className="insignia ml-1 bg-amber-300 text-amber-900">Admin</span>
      </h2>
      <form onSubmit={enviar} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6" noValidate>
        <Campo id="recompensa-nombre" etiqueta="Nombre" error={errores.nombre} className="lg:col-span-2">
          <input id="recompensa-nombre" type="text" maxLength={40} className={claseCampo(errores.nombre)}
                 placeholder="Ej: Termo ecológico" value={valores.nombre} onChange={cambiar('nombre')} />
        </Campo>
        <Campo id="recompensa-descripcion" etiqueta="Descripción" error={errores.descripcion} className="lg:col-span-2">
          <input id="recompensa-descripcion" type="text" maxLength={80} className={claseCampo(errores.descripcion)}
                 placeholder="Breve descripción del premio" value={valores.descripcion} onChange={cambiar('descripcion')} />
        </Campo>
        <Campo id="recompensa-icono" etiqueta="Ícono">
          <select id="recompensa-icono" className="campo" value={valores.icono} onChange={cambiar('icono')}>
            {ICONOS_RECOMPENSA.map((i) => <option key={i}>{i}</option>)}
          </select>
        </Campo>
        <Campo id="recompensa-costo" etiqueta="Costo (pts)" error={errores.costo}>
          <input id="recompensa-costo" type="number" min="10" max="5000" className={claseCampo(errores.costo)}
                 placeholder="100" value={valores.costo} onChange={cambiar('costo')} />
        </Campo>
        <Campo id="recompensa-stock" etiqueta="Unidades" error={errores.stock}>
          <input id="recompensa-stock" type="number" min="1" max="1000" className={claseCampo(errores.stock)}
                 placeholder="10" value={valores.stock} onChange={cambiar('stock')} />
        </Campo>
        <div className="flex items-end sm:col-span-2 lg:col-span-5 lg:justify-end">
          <button type="submit" className="btn btn-primario w-full sm:w-auto">Agregar recompensa</button>
        </div>
      </form>
    </section>
  )
}

function TarjetaRecompensa({ recompensa: p, saldo, esAdmin, onCanjear, onEliminar }) {
  const agotada = p.stock <= 0
  const faltan = p.costo - saldo
  const avance = Math.min(100, Math.round((saldo / p.costo) * 100))

  return (
    <article className={`tarjeta flex flex-col transition hover:-translate-y-1 hover:shadow-md ${agotada ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <span className="text-5xl">{p.icono}</span>
        <span className="insignia bg-emerald-100 text-emerald-800">⭐ {numero(p.costo)} pts</span>
      </div>
      <h3 className="mt-3 text-lg font-bold text-slate-800">{p.nombre}</h3>
      <p className="text-sm text-slate-500">{p.descripcion}</p>
      <p className="mt-2 text-xs text-slate-400">{agotada ? 'Sin unidades disponibles' : `${p.stock} unidades disponibles`}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${avance}%` }} />
      </div>
      <div className="mt-4 flex gap-2 pt-1">
        {agotada && <button type="button" className="btn btn-secundario w-full" disabled>Agotada</button>}
        {!agotada && faltan > 0 && <button type="button" className="btn btn-secundario w-full" disabled>Te faltan {numero(faltan)} pts</button>}
        {!agotada && faltan <= 0 && <button type="button" onClick={() => onCanjear(p)} className="btn btn-primario w-full">Canjear</button>}
        {esAdmin && (
          <button type="button" onClick={() => onEliminar(p)} className="btn btn-secundario text-rose-600"
                  title="Eliminar recompensa" aria-label={`Eliminar ${p.nombre}`}>🗑️</button>
        )}
      </div>
    </article>
  )
}

export default function Recompensas() {
  const { usuario, esAdmin, resumen, version, refrescar } = useAuth()
  const { notificar, confirmar } = useUI()
  const [soloAlcanzables, setSoloAlcanzables] = useState(false)

  const catalogo = useMemo(() => recompensas.todas(), [version])
  const canjes = useMemo(() => recompensas.canjesDeUsuario(usuario.id), [usuario.id, version])
  const visibles = catalogo.filter((p) => !soloAlcanzables || (p.costo <= resumen.saldo && p.stock > 0))

  const canjear = async (p) => {
    const aceptar = await confirmar({
      titulo: `¿Canjear "${p.nombre}"?`,
      mensaje: `Se descontarán ${p.costo} puntos de tu saldo.`,
      textoAceptar: 'Sí, canjear',
    })
    if (!aceptar) return
    const resultado = recompensas.canjear(p.id, usuario.id)
    notificar(resultado.ok ? `¡Canje exitoso! Tu código es ${resultado.canje.codigo} 🎉` : resultado.error, resultado.ok ? 'exito' : 'error')
    refrescar()
  }

  const eliminar = async (p) => {
    const aceptar = await confirmar({
      titulo: '¿Eliminar recompensa?',
      mensaje: 'Dejará de aparecer en el catálogo. Los canjes ya hechos se conservan.',
      textoAceptar: 'Eliminar',
      peligro: true,
    })
    if (!aceptar) return
    recompensas.eliminar(p.id)
    notificar('Recompensa eliminada.', 'info')
    refrescar()
  }

  return (
    <>
      <section className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-lime-500 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">🎁 Recompensas</h1>
          <p className="text-emerald-50">Cambia los puntos que ganaste cuidando el ambiente por premios de nuestros aliados.</p>
        </div>
        <div className="rounded-xl bg-white/15 px-5 py-3 text-center">
          <p className="text-sm text-emerald-50">Tienes</p>
          <p className="text-3xl font-extrabold">⭐ {numero(resumen.saldo)}</p>
          <p className="text-sm text-emerald-50">puntos disponibles</p>
        </div>
      </section>

      {esAdmin && <FormularioRecompensa onCreada={refrescar} />}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-700">Catálogo</h2>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={soloAlcanzables}
                   onChange={(e) => setSoloAlcanzables(e.target.checked)} />
            Solo las que puedo canjear
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.length === 0 && (
            <p className="tarjeta py-10 text-center text-slate-400 sm:col-span-2 lg:col-span-3">
              Aún no te alcanza para ninguna recompensa. <Link to="/reciclar" className="font-semibold text-emerald-700 underline">¡Sigue reciclando!</Link>
            </p>
          )}
          {visibles.map((p) => (
            <TarjetaRecompensa key={p.id} recompensa={p} saldo={resumen.saldo} esAdmin={esAdmin} onCanjear={canjear} onEliminar={eliminar} />
          ))}
        </div>
      </section>

      <section className="tarjeta">
        <h2 className="text-lg font-bold text-slate-700">Mis canjes</h2>
        <p className="text-sm text-slate-500">Presenta el código en el punto aliado para reclamar tu recompensa.</p>
        <ul className="mt-4 divide-y divide-slate-100">
          {canjes.length === 0 && <li className="py-8 text-center text-slate-400">Todavía no has canjeado recompensas.</li>}
          {canjes.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="text-2xl">{c.icono}</span>
              <div className="flex-1">
                <p className="font-medium text-slate-700">{c.nombre}</p>
                <p className="text-xs text-slate-400">{fecha(c.fecha)} · -{numero(c.costo)} pts</p>
              </div>
              <code className="rounded-lg bg-slate-100 px-3 py-1 font-mono font-bold tracking-wider text-slate-700">{c.codigo}</code>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
