import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { CATEGORIAS_REPORTE, ESTADOS_CON_PUNTOS, ESTADOS_REPORTE, PUNTOS_POR_REPORTE, categoria } from '../data/catalogos'
import { api } from '../services/api'
import { useCargar } from '../hooks/useCargar'
import Campo from '../components/Campo'
import Cargando, { MensajeError } from '../components/Cargando'
import { claseCampo } from '../utils/estilos'
import { fecha } from '../utils/formato'
import { validar } from '../utils/validaciones'

const TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024
const ANCHO_MAXIMO_FOTO = 800
const valoresIniciales = { categoria: '', titulo: '', ubicacion: '', descripcion: '' }

// Reduce la imagen a 800 px de ancho en JPG antes de enviarla al backend
function reducirImagen(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader()
    lector.onerror = rechazar
    lector.onload = () => {
      const imagen = new Image()
      imagen.onerror = rechazar
      imagen.onload = () => {
        const escala = Math.min(1, ANCHO_MAXIMO_FOTO / imagen.width)
        const lienzo = document.createElement('canvas')
        lienzo.width = Math.round(imagen.width * escala)
        lienzo.height = Math.round(imagen.height * escala)
        lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
        resolver(lienzo.toDataURL('image/jpeg', 0.7))
      }
      imagen.src = lector.result
    }
    lector.readAsDataURL(archivo)
  })
}

function FormularioReporte({ onEnviado }) {
  const { notificar } = useUI()
  const [valores, setValores] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})
  const [foto, setFoto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const campoFoto = useRef(null)

  const cambiar = (campo) => (e) => {
    setValores({ ...valores, [campo]: e.target.value })
    setErrores({ ...errores, [campo]: '' })
  }

  const quitarFoto = () => {
    setFoto('')
    if (campoFoto.current) campoFoto.current.value = ''
  }

  const elegirFoto = async (e) => {
    const archivo = e.target.files[0]
    setErrores({ ...errores, foto: '' })
    if (!archivo) return quitarFoto()
    if (!archivo.type.startsWith('image/')) {
      quitarFoto()
      return setErrores({ ...errores, foto: 'El archivo debe ser una imagen.' })
    }
    if (archivo.size > TAMANO_MAXIMO_FOTO) {
      quitarFoto()
      return setErrores({ ...errores, foto: 'La imagen pesa más de 5 MB.' })
    }
    try {
      setFoto(await reducirImagen(archivo))
    } catch {
      quitarFoto()
      setErrores({ ...errores, foto: 'No se pudo leer la imagen.' })
    }
  }

  const enviar = async (e) => {
    e.preventDefault()
    const nuevosErrores = validar(valores, {
      categoria: (v) => (v ? '' : 'Elige una categoría.'),
      titulo: (v) => (v.length >= 5 ? '' : 'El título debe tener al menos 5 caracteres.'),
      ubicacion: (v) => (v.length >= 5 ? '' : 'Indica una ubicación más precisa.'),
      descripcion: (v) => (v.length >= 20 ? '' : 'Describe el problema con al menos 20 caracteres.'),
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) return

    setEnviando(true)
    try {
      await api.reportes.crear({ ...valores, foto })
      notificar('¡Reporte enviado! Un administrador lo revisará pronto.')
      setValores(valoresIniciales)
      quitarFoto()
      onEnviado()
    } catch (error) {
      if (error.errores && Object.keys(error.errores).length) setErrores(error.errores)
      notificar(error.message, 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="mt-4 space-y-4" noValidate>
      <Campo id="reporte-categoria" etiqueta="Categoría" error={errores.categoria}>
        <select id="reporte-categoria" className={claseCampo(errores.categoria)} value={valores.categoria} onChange={cambiar('categoria')}>
          <option value="">Selecciona una categoría</option>
          {CATEGORIAS_REPORTE.map((c) => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
        </select>
      </Campo>

      <Campo id="reporte-titulo" etiqueta="Título" error={errores.titulo}>
        <input id="reporte-titulo" type="text" maxLength={80} className={claseCampo(errores.titulo)}
               placeholder="Ej: Basuras en la esquina del parque" value={valores.titulo} onChange={cambiar('titulo')} />
      </Campo>

      <Campo id="reporte-ubicacion" etiqueta="Ubicación" error={errores.ubicacion}>
        <input id="reporte-ubicacion" type="text" maxLength={120} className={claseCampo(errores.ubicacion)}
               placeholder="Dirección, barrio o punto de referencia" value={valores.ubicacion} onChange={cambiar('ubicacion')} />
      </Campo>

      <Campo id="reporte-descripcion" etiqueta="Descripción" error={errores.descripcion}>
        <textarea id="reporte-descripcion" rows="4" maxLength={500} className={claseCampo(errores.descripcion)}
                  placeholder="Describe qué está pasando, desde cuándo y cómo afecta al entorno."
                  value={valores.descripcion} onChange={cambiar('descripcion')} />
        <p className="mt-1 text-right text-xs text-slate-400">{valores.descripcion.length}/500</p>
      </Campo>

      <Campo id="reporte-foto" etiqueta="Foto" opcional error={errores.foto}>
        <input id="reporte-foto" ref={campoFoto} type="file" accept="image/*" onChange={elegirFoto}
               className={claseCampo(errores.foto, 'p-1.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100')} />
        {foto && (
          <div className="relative mt-2">
            <img src={foto} alt="Vista previa de la foto" className="max-h-48 w-full rounded-lg object-cover" />
            <button type="button" onClick={quitarFoto} className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-rose-600 shadow">
              Quitar
            </button>
          </div>
        )}
      </Campo>

      <button type="submit" className="btn btn-primario w-full" disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar reporte'}
      </button>
    </form>
  )
}

function TarjetaReporte({ reporte, onAccion }) {
  const { usuario, esAdmin } = useAuth()
  const cat = categoria(reporte.categoria)
  const estado = ESTADOS_REPORTE[reporte.estado]
  const esMio = reporte.usuario?.id === usuario.id
  const boton = (accion, texto, primario = false) => (
    <button type="button" onClick={() => onAccion(reporte.id, accion)}
            className={`btn px-3 py-1.5 text-xs ${primario ? 'btn-primario' : 'btn-secundario'} ${accion === 'rechazado' || accion === 'eliminar' ? 'text-rose-600' : ''}`}>
      {texto}
    </button>
  )

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      {reporte.foto
        ? <img src={reporte.foto} alt="Foto del reporte" className="h-40 w-full object-cover" loading="lazy" />
        : <div className="flex h-40 items-center justify-center bg-gradient-to-br from-emerald-50 to-lime-50 text-6xl">{cat?.icono}</div>}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`insignia ${estado.clase}`}>{estado.nombre}</span>
          <span className="text-xs text-slate-500">{cat?.icono} {cat?.nombre}</span>
        </div>
        <h3 className="mt-2 font-bold text-slate-800">{reporte.titulo}</h3>
        <p className="text-sm text-slate-500">📌 {reporte.ubicacion}</p>
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">{reporte.descripcion}</p>
        <p className="mt-3 text-xs text-slate-400">
          {esMio ? 'Tú' : reporte.usuario?.nombre || 'Usuario'} · {fecha(reporte.fecha)}
          {ESTADOS_CON_PUNTOS.includes(reporte.estado) && <> · <span className="font-semibold text-emerald-600">+{PUNTOS_POR_REPORTE} pts</span></>}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          {esAdmin && reporte.estado === 'pendiente' && <>{boton('en_proceso', `✔ Validar (+${PUNTOS_POR_REPORTE})`, true)}{boton('rechazado', 'Rechazar')}</>}
          {esAdmin && reporte.estado === 'en_proceso' && boton('resuelto', 'Marcar resuelto', true)}
          {esAdmin && reporte.estado === 'rechazado' && boton('pendiente', 'Reabrir')}
          {esMio && reporte.estado === 'pendiente' && boton('eliminar', 'Eliminar')}
        </div>
      </div>
    </article>
  )
}

const MENSAJES_ESTADO = {
  en_proceso: `Reporte validado. El ciudadano ganó ${PUNTOS_POR_REPORTE} puntos.`,
  resuelto: 'Reporte marcado como resuelto.',
  rechazado: 'Reporte rechazado.',
  pendiente: 'Reporte reabierto.',
}

export default function Reportes() {
  const { usuario, refrescar } = useAuth()
  const { notificar, confirmar } = useUI()
  const reportes = useCargar(api.reportes.listar)
  const [parametros, setParametros] = useSearchParams()
  const [texto, setTexto] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [soloMios, setSoloMios] = useState(false)

  // El filtro de estado vive en la URL (?estado=pendiente) para poder enlazarlo desde otras páginas
  const filtroEstado = ESTADOS_REPORTE[parametros.get('estado')] ? parametros.get('estado') : ''
  const cambiarEstado = (estado) => setParametros(estado ? { estado } : {}, { replace: true })

  const todos = reportes.datos
  const busqueda = texto.trim().toLowerCase()
  const visibles = todos.filter((r) =>
    (!filtroEstado || r.estado === filtroEstado) &&
    (!filtroCategoria || r.categoria === filtroCategoria) &&
    (!soloMios || r.usuario?.id === usuario.id) &&
    (!busqueda || r.titulo.toLowerCase().includes(busqueda) || r.ubicacion.toLowerCase().includes(busqueda)),
  )

  const actualizar = () => {
    reportes.recargar()
    refrescar()
  }

  const ejecutarAccion = async (id, accion) => {
    try {
      if (accion === 'eliminar') {
        const aceptar = await confirmar({
          titulo: '¿Eliminar reporte?',
          mensaje: 'El reporte se borrará definitivamente.',
          textoAceptar: 'Eliminar',
          peligro: true,
        })
        if (!aceptar) return
        await api.reportes.eliminar(id)
        notificar('Reporte eliminado.', 'info')
      } else {
        await api.reportes.cambiarEstado(id, accion)
        notificar(MENSAJES_ESTADO[accion])
      }
      actualizar()
    } catch (error) {
      notificar(error.message, 'error')
    }
  }

  return (
    <>
      <section>
        <h1 className="titulo-pagina">📍 Reportes ambientales</h1>
        <p className="text-slate-500">
          Reporta problemas ambientales de tu barrio o campus. Cuando un administrador valida tu reporte, ganas{' '}
          <strong className="text-emerald-700">{PUNTOS_POR_REPORTE} puntos</strong>.
        </p>
      </section>

      {/* Contadores por estado (también sirven como filtro rápido) */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Reportes por estado">
        {Object.entries(ESTADOS_REPORTE).map(([id, e]) => (
          <button key={id} type="button" aria-pressed={filtroEstado === id}
                  onClick={() => cambiarEstado(filtroEstado === id ? '' : id)}
                  className={`tarjeta p-3 text-left transition hover:ring-emerald-300 ${filtroEstado === id ? 'ring-2 ring-emerald-500' : ''}`}>
            <span className={`insignia ${e.clase}`}>{e.nombre}</span>
            <span className="mt-1 block text-2xl font-extrabold text-slate-700">{todos.filter((r) => r.estado === id).length}</span>
          </button>
        ))}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="tarjeta lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-slate-700">Nuevo reporte</h2>
          <FormularioReporte onEnviado={actualizar} />
        </section>

        <section className="space-y-4 lg:col-span-2">
          <div className="tarjeta grid gap-3 p-4 sm:grid-cols-2" role="search">
            <input type="search" aria-label="Buscar" className="campo sm:col-span-2" placeholder="🔎 Buscar por título o ubicación"
                   value={texto} onChange={(e) => setTexto(e.target.value)} />
            <select aria-label="Estado" className="campo text-sm" value={filtroEstado} onChange={(e) => cambiarEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS_REPORTE).map(([id, e]) => <option key={id} value={id}>{e.nombre}</option>)}
            </select>
            <select aria-label="Categoría" className="campo text-sm" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              {CATEGORIAS_REPORTE.map((c) => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
              <input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={soloMios} onChange={(e) => setSoloMios(e.target.checked)} />
              Ver solo mis reportes
            </label>
          </div>

          {reportes.error && <MensajeError mensaje={reportes.error} onReintentar={reportes.recargar} />}
          {reportes.cargando ? (
            <Cargando texto="Cargando reportes..." />
          ) : (
            <>
              <p className="text-sm text-slate-500">Mostrando {visibles.length} de {todos.length} reportes</p>
              <div className="grid gap-4 md:grid-cols-2">
                {visibles.length === 0 && (
                  <p className="tarjeta py-10 text-center text-slate-400 md:col-span-2">No hay reportes que coincidan con los filtros.</p>
                )}
                {visibles.map((r) => <TarjetaReporte key={r.id} reporte={r} onAccion={ejecutarAccion} />)}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  )
}
