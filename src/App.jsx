import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Reciclar from './pages/Reciclar'
import Reportes from './pages/Reportes'
import Recompensas from './pages/Recompensas'
import NoEncontrada from './pages/NoEncontrada'

export default function App() {
  const { usuario } = useAuth()

  return (
    <Routes>
      {/* Ruta pública: si ya hay sesión se va directo al inicio */}
      <Route path="/login" element={usuario ? <Navigate to="/inicio" replace /> : <Login />} />

      {/* Rutas privadas: comparten el menú y el pie de página */}
      <Route element={<Layout />}>
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/reciclar" element={<Reciclar />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/recompensas" element={<Recompensas />} />
      </Route>

      <Route path="/" element={<Navigate to={usuario ? '/inicio' : '/login'} replace />} />
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  )
}
