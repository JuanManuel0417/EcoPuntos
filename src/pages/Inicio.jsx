import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ESTADOS_REPORTE, PUNTOS_ACOPIO, PUNTOS_POR_REPORTE, categoria, material, puntoAcopio } from '../data/catalogos'
import { entregas, puntosDeReporte, recompensas, reportes } from '../data/db'
import { fecha, fechaLarga, numero } from '../utils/formato'

function TarjetaResumen({ titulo, valor, detalle, borde, color }) {
  return (
    <article className={`tarjeta border-l-4 ${borde}`}>
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className={`mt-1 text-3xl font-extrabold ${color}`}>{valor}</p>
      <p className="text-xs text-slate-400">{detalle}</p>
    </article>
  )
}

// Une entregas, reportes y canjes en una sola lista ordenada por fecha
function obtenerActividad(usuarioId) {
  return [
    ...entregas.deUsuario(usuarioId).map((e) => ({
      id: e.id,
      fecha: e.fecha,
      icono: material(e.materialId).icono,
      titulo: `Entregaste ${numero(e.kg)} kg de ${material(e.materialId).nombre.toLowerCase()}`,
      detalle: puntoAcopio(e.puntoId)?.nombre || '',
      puntos: `+${e.puntos}`,
      color: 'text-emerald-600',
    })),
    ...reportes.todos().filter((r) => r.usuarioId === usuarioId).map((r) => ({
      id: r.id,
      fecha: r.fecha,
      icono: categoria(r.categoriaId).icono,
      titulo: `Reportaste: ${r.titulo}`,
      detalle: `Estado: ${ESTADOS_REPORTE[r.estado].nombre}`,
      puntos: puntosDeReporte(r) ? `+${puntosDeReporte(r)}` : '—',
      color: puntosDeReporte(r) ? 'text-emerald-600' : 'text-slate-400',
    })),
    ...recompensas.canjesDeUsuario(usuarioId).map((c) => ({
      id: c.id,
      fecha: c.fecha,
      icono: c.icono,
      titulo: `Canjeaste: ${c.nombre}`,
      detalle: `Código ${c.codigo}`,
      puntos: `-${c.costo}`,
      color: 'text-rose-600',
    })),
  ]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 6)
}

export default function Inicio() {
  const { usuario, esAdmin, resumen, version } = useAuth()
  const [anchoBarra, setAnchoBarra] = useState(0)

  const actividad = useMemo(() => obtenerActividad(usuario.id), [usuario.id, version])
  const pendientes = useMemo(() => reportes.todos().filter((r) => r.estado === 'pendiente').length, [version])

  // La barra de nivel arranca en 0 y se anima hasta el progreso real
  useEffect(() => {
    const animacion = requestAnimationFrame(() => setAnchoBarra(resumen.progreso))
    return () => cancelAnimationFrame(animacion)
  }, [resumen.progreso])

  return (
    <>
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="titulo-pagina">¡Hola, {usuario.nombre.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500">Este es el impacto positivo que has generado con EcoPuntos.</p>
        </div>
        <p className="text-sm text-slate-500">{fechaLarga()}</p>
      </section>

      {esAdmin && (
        <section className="flex flex-col gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-amber-900">
            <strong>Panel de administrador:</strong> hay <strong>{pendientes}</strong> reporte(s) ambiental(es) pendiente(s) por revisar.
          </p>
          <Link to="/reportes?estado=pendiente" className="btn btn-primario">Revisar reportes</Link>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Resumen">
        <TarjetaResumen titulo="⭐ Puntos disponibles" valor={numero(resumen.saldo)} borde="border-emerald-500" color="text-emerald-700"
                        detalle={`${numero(resumen.ganados)} ganados · ${numero(resumen.gastados)} canjeados`} />
        <TarjetaResumen titulo="♻️ Kilos reciclados" valor={numero(resumen.kg)} borde="border-sky-500" color="text-sky-700"
                        detalle={`${resumen.totalEntregas} entregas registradas`} />
        <TarjetaResumen titulo="🌍 CO₂ evitado" valor={numero(resumen.co2)} borde="border-lime-500" color="text-lime-700"
                        detalle="kg aproximados" />
        <TarjetaResumen titulo="📍 Reportes" valor={resumen.totalReportes} borde="border-amber-500" color="text-amber-700"
                        detalle={`${resumen.reportesValidados} validados (+${PUNTOS_POR_REPORTE} pts c/u)`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6">
          <article className="tarjeta">
            <h2 className="font-bold text-slate-700">Tu nivel ecológico</h2>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-5xl">{resumen.nivel.icono}</span>
              <div>
                <p className="text-2xl font-extrabold text-emerald-700">{resumen.nivel.nombre}</p>
                <p className="text-sm text-slate-500">
                  {resumen.siguienteNivel
                    ? `Te faltan ${numero(resumen.siguienteNivel.minimo - resumen.ganados)} pts para ser ${resumen.siguienteNivel.nombre} ${resumen.siguienteNivel.icono}`
                    : '¡Llegaste al nivel máximo! Eres un ejemplo para tu comunidad.'}
                </p>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar"
                 aria-label="Progreso al siguiente nivel" aria-valuemin={0} aria-valuemax={100} aria-valuenow={resumen.progreso}>
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-700"
                   style={{ width: `${anchoBarra}%` }} />
            </div>
          </article>

          <article className="tarjeta">
            <h2 className="font-bold text-slate-700">¿Qué quieres hacer hoy?</h2>
            <div className="mt-4 grid gap-3">
              <Link to="/reciclar" className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 font-medium text-emerald-800 transition hover:bg-emerald-100">
                <span className="text-2xl">♻️</span> Registrar una entrega de reciclaje
              </Link>
              <Link to="/reportes" className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 font-medium text-amber-800 transition hover:bg-amber-100">
                <span className="text-2xl">📍</span> Reportar un problema ambiental
              </Link>
              <Link to="/recompensas" className="flex items-center gap-3 rounded-xl bg-sky-50 p-3 font-medium text-sky-800 transition hover:bg-sky-100">
                <span className="text-2xl">🎁</span> Canjear mis puntos
              </Link>
            </div>
          </article>
        </section>

        <section className="tarjeta lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700">Actividad reciente</h2>
            <span className="text-xs text-slate-400">Últimos movimientos</span>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {actividad.length === 0 && (
              <li className="py-10 text-center text-slate-400">
                Aún no tienes actividad. <Link to="/reciclar" className="font-semibold text-emerald-700 underline">Registra tu primera entrega</Link>.
              </li>
            )}
            {actividad.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">{a.icono}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-700">{a.titulo}</p>
                  <p className="truncate text-xs text-slate-400">{fecha(a.fecha)} · {a.detalle}</p>
                </div>
                <span className={`font-bold ${a.color}`}>{a.puntos}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold text-slate-700">Puntos de acopio cercanos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PUNTOS_ACOPIO.map((p) => (
            <article key={p.id} className="tarjeta">
              <h3 className="font-bold text-slate-700">{p.nombre}</h3>
              <p className="mt-1 text-sm text-slate-500">📌 {p.direccion}</p>
              <p className="text-sm text-slate-500">🕒 {p.horario}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.materiales.map((id) => (
                  <span key={id} className="insignia bg-emerald-50 text-emerald-800">{material(id).icono} {material(id).nombre}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
