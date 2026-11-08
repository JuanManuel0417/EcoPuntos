import { Link } from 'react-router-dom'

export default function NoEncontrada() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <span className="text-7xl">🍂</span>
      <h1 className="titulo-pagina">Página no encontrada</h1>
      <p className="text-slate-500">La dirección que buscas no existe en EcoPuntos.</p>
      <Link to="/" className="btn btn-primario">Volver al inicio</Link>
    </main>
  )
}
