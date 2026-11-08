const ANIO = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row">
        <p>♻️ EcoPuntos · Recicla, reporta y gana</p>
        <p>Proyecto PPI · Programación Web · I.U. Pascual Bravo {ANIO}</p>
      </div>
    </footer>
  )
}
