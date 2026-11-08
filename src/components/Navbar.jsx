import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { numero } from '../utils/formato'

const PAGINAS = [
  { ruta: '/inicio', nombre: 'Inicio', icono: '🏠' },
  { ruta: '/reciclar', nombre: 'Reciclar', icono: '♻️' },
  { ruta: '/reportes', nombre: 'Reportes', icono: '📍' },
  { ruta: '/recompensas', nombre: 'Recompensas', icono: '🎁' },
]

const claseEnlace = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'
  }`

function InsigniaAdmin() {
  return <span className="insignia bg-amber-300 text-amber-900">Admin</span>
}

export default function Navbar() {
  const { usuario, esAdmin, resumen, cerrarSesion } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const navegar = useNavigate()

  const salir = () => {
    cerrarSesion()
    navegar('/login')
  }

  const enlaces = PAGINAS.map((p) => (
    <NavLink key={p.ruta} to={p.ruta} className={claseEnlace} onClick={() => setMenuAbierto(false)}>
      {p.icono} {p.nombre}
    </NavLink>
  ))

  return (
    <header className="sticky top-0 z-30 bg-emerald-700 shadow-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3" aria-label="Principal">
        <Link to="/inicio" className="flex items-center gap-2 text-xl font-extrabold text-white">
          <img src="/logo.svg" alt="" className="h-8 w-8" /> EcoPuntos
        </Link>

        <div className="hidden items-center gap-1 md:flex">{enlaces}</div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white" title="Puntos disponibles">
            ⭐ {numero(resumen.saldo)} pts
          </span>
          <span className="flex items-center gap-2 text-sm text-emerald-50">
            {usuario.nombre.split(' ')[0]} {esAdmin && <InsigniaAdmin />}
          </span>
          <button type="button" onClick={salir} className="btn bg-white/10 px-3 py-1.5 text-white hover:bg-white/20 focus:ring-white">
            Salir
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="rounded-lg p-2 text-white hover:bg-emerald-600 md:hidden"
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
          aria-controls="menu-movil"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {menuAbierto && (
        <div id="menu-movil" className="border-t border-emerald-600 px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-3">{enlaces}</div>
          <div className="mt-3 flex items-center justify-between border-t border-emerald-600 pt-3 text-emerald-50">
            <span>
              {usuario.nombre} {esAdmin && <InsigniaAdmin />} · ⭐ {numero(resumen.saldo)} pts
            </span>
            <button type="button" onClick={salir} className="btn bg-white/10 px-3 py-1.5 text-white hover:bg-white/20">
              Salir
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
