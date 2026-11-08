import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import Footer from './Footer'

// Plantilla de las páginas privadas: si no hay sesión, redirige al login
export default function Layout() {
  const { usuario } = useAuth()
  const { pathname } = useLocation()

  // Al cambiar de página se vuelve al inicio del scroll
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (!usuario) return <Navigate to="/login" replace />

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
