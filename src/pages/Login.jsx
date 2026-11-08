import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usuarios } from '../data/db'
import Campo from '../components/Campo'
import { claseCampo } from '../utils/estilos'
import { validar, validarCorreo } from '../utils/validaciones'

function nuevoCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  return { pregunta: `${a} + ${b}`, resultado: a + b }
}

// Campo de contraseña con botón para mostrarla u ocultarla
function CampoPassword({ id, valor, onChange, error, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className={claseCampo(error, 'pr-20')}
        value={valor}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute inset-y-0 right-0 px-3 text-sm font-medium text-emerald-700 hover:text-emerald-900"
      >
        {visible ? 'Ocultar' : 'Ver'}
      </button>
    </div>
  )
}

function FormularioLogin() {
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const [valores, setValores] = useState({ correo: '', password: '', captcha: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [captcha, setCaptcha] = useState(nuevoCaptcha)

  const cambiar = (campo) => (e) => {
    setValores({ ...valores, [campo]: e.target.value })
    setErrores({ ...errores, [campo]: '' })
  }

  const recargarCaptcha = () => {
    setCaptcha(nuevoCaptcha())
    setValores((v) => ({ ...v, captcha: '' }))
  }

  const enviar = (e) => {
    e.preventDefault()
    setErrorGeneral('')
    const nuevosErrores = validar(valores, {
      correo: validarCorreo,
      password: (v) => (v ? '' : 'Escribe tu contraseña.'),
      captcha: (v) => {
        if (!v) return 'Resuelve la operación.'
        return Number(v) === captcha.resultado ? '' : 'El resultado no es correcto.'
      },
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) {
      if (nuevosErrores.captcha) recargarCaptcha()
      return
    }

    const resultado = iniciarSesion(valores.correo, valores.password)
    if (!resultado.ok) {
      setErrorGeneral(resultado.error)
      recargarCaptcha()
      return
    }
    navegar('/inicio')
  }

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      <div>
        <h2 className="text-2xl font-bold">¡Hola de nuevo! 👋</h2>
        <p className="text-sm text-slate-500">Ingresa con tu correo y contraseña.</p>
      </div>

      <Campo id="login-correo" etiqueta="Correo electrónico" error={errores.correo}>
        <input id="login-correo" type="email" className={claseCampo(errores.correo)} placeholder="tucorreo@ejemplo.com"
               autoComplete="username" value={valores.correo} onChange={cambiar('correo')} aria-invalid={!!errores.correo} />
      </Campo>

      <Campo id="login-password" etiqueta="Contraseña" error={errores.password}>
        <CampoPassword id="login-password" valor={valores.password} onChange={cambiar('password')} error={errores.password}
                       placeholder="••••••••" autoComplete="current-password" />
      </Campo>

      <Campo id="login-captcha" error={errores.captcha}>
        <label htmlFor="login-captcha" className="etiqueta">
          Verificación: ¿cuánto es <span className="font-mono font-bold text-emerald-700">{captcha.pregunta}</span>?
        </label>
        <div className="flex gap-2">
          <input id="login-captcha" type="number" inputMode="numeric" className={claseCampo(errores.captcha)} placeholder="Resultado"
                 value={valores.captcha} onChange={cambiar('captcha')} aria-invalid={!!errores.captcha} />
          <button type="button" onClick={recargarCaptcha} className="btn btn-secundario" aria-label="Generar otra operación" title="Generar otra operación">🔄</button>
        </div>
      </Campo>

      {errorGeneral && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{errorGeneral}</p>}

      <button type="submit" className="btn btn-primario w-full py-2.5">Ingresar</button>

      <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900">
        <p className="font-semibold">Cuentas de prueba:</p>
        <p>Ciudadano: <code>juan@ecopuntos.co</code> / <code>juan123</code></p>
        <p>Administrador: <code>admin@ecopuntos.co</code> / <code>admin123</code></p>
      </div>
    </form>
  )
}

function FormularioRegistro() {
  const { registrar } = useAuth()
  const navegar = useNavigate()
  const [valores, setValores] = useState({ nombre: '', correo: '', password: '', confirmar: '', terminos: false })
  const [errores, setErrores] = useState({})

  const cambiar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setValores({ ...valores, [campo]: valor })
    setErrores({ ...errores, [campo]: '' })
  }

  const enviar = (e) => {
    e.preventDefault()
    const nuevosErrores = validar(valores, {
      nombre: (v) => {
        if (v.length < 3) return 'Escribe tu nombre completo (mínimo 3 letras).'
        return /^[a-zA-ZÀ-ÿñÑ\s]+$/.test(v) ? '' : 'El nombre solo puede tener letras y espacios.'
      },
      correo: (v) => validarCorreo(v) || (usuarios.porCorreo(v) ? 'Ya existe una cuenta con ese correo.' : ''),
      password: (v) => {
        if (v.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
        return /\d/.test(v) && /[a-zA-Z]/.test(v) ? '' : 'Usa letras y números.'
      },
      confirmar: (v, todos) => (v === todos.password ? '' : 'Las contraseñas no coinciden.'),
      terminos: (v) => (v ? '' : 'Debes aceptar para continuar.'),
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) return

    const resultado = registrar(valores)
    if (!resultado.ok) return setErrores({ correo: resultado.error })
    navegar('/inicio')
  }

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      <div>
        <h2 className="text-2xl font-bold">Únete a EcoPuntos 🌱</h2>
        <p className="text-sm text-slate-500">Crea tu cuenta y empieza a sumar puntos.</p>
      </div>

      <Campo id="registro-nombre" etiqueta="Nombre completo" error={errores.nombre}>
        <input id="registro-nombre" type="text" maxLength={60} className={claseCampo(errores.nombre)} placeholder="Ej: Ana María López"
               autoComplete="name" value={valores.nombre} onChange={cambiar('nombre')} />
      </Campo>

      <Campo id="registro-correo" etiqueta="Correo electrónico" error={errores.correo}>
        <input id="registro-correo" type="email" className={claseCampo(errores.correo)} placeholder="tucorreo@ejemplo.com"
               autoComplete="email" value={valores.correo} onChange={cambiar('correo')} />
      </Campo>

      <Campo id="registro-password" etiqueta="Contraseña" error={errores.password}>
        <CampoPassword id="registro-password" valor={valores.password} onChange={cambiar('password')} error={errores.password}
                       placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
      </Campo>

      <Campo id="registro-confirmar" etiqueta="Confirmar contraseña" error={errores.confirmar}>
        <input id="registro-confirmar" type="password" className={claseCampo(errores.confirmar)} placeholder="Repite la contraseña"
               autoComplete="new-password" value={valores.confirmar} onChange={cambiar('confirmar')} />
      </Campo>

      <Campo id="registro-terminos" error={errores.terminos}>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input id="registro-terminos" type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
                 checked={valores.terminos} onChange={cambiar('terminos')} />
          <span>Acepto usar EcoPuntos de forma responsable y reportar solo información verdadera.</span>
        </label>
      </Campo>

      <button type="submit" className="btn btn-primario w-full py-2.5">Crear cuenta</button>
    </form>
  )
}

export default function Login() {
  const [pestana, setPestana] = useState('login')

  const clasePestana = (activa) =>
    `rounded-md py-2 text-sm font-semibold transition ${activa ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Panel informativo (solo en pantallas grandes) */}
      <section className="hidden flex-col justify-between bg-gradient-to-br from-emerald-800 via-emerald-600 to-lime-500 p-12 text-white lg:flex">
        <span className="flex items-center gap-3 text-2xl font-extrabold">
          <img src="/logo.svg" alt="" className="h-10 w-10" /> EcoPuntos
        </span>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">Cuidar el planeta<br />ahora tiene recompensa.</h1>
          <p className="mt-4 max-w-md text-lg text-emerald-50">
            Recicla, reporta problemas ambientales de tu barrio o campus y gana puntos que puedes cambiar por premios.
          </p>
          <ul className="mt-8 space-y-4 text-emerald-50">
            <li className="flex items-center gap-3"><span className="text-2xl">♻️</span> Registra tus entregas de reciclaje</li>
            <li className="flex items-center gap-3"><span className="text-2xl">📍</span> Reporta basuras, quemas o vertimientos</li>
            <li className="flex items-center gap-3"><span className="text-2xl">🎁</span> Canjea tus puntos por recompensas</li>
          </ul>
        </div>
        <p className="text-sm text-emerald-100">Proyecto PPI · I.U. Pascual Bravo · Hecho con React</p>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <img src="/logo.svg" alt="" className="h-12 w-12 rounded-full bg-emerald-600" />
            <span className="text-3xl font-extrabold text-emerald-700">EcoPuntos</span>
          </div>

          <div className="tarjeta p-6 sm:p-8">
            <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1" role="tablist">
              <button type="button" role="tab" aria-selected={pestana === 'login'} className={clasePestana(pestana === 'login')}
                      onClick={() => setPestana('login')}>Iniciar sesión</button>
              <button type="button" role="tab" aria-selected={pestana === 'registro'} className={clasePestana(pestana === 'registro')}
                      onClick={() => setPestana('registro')}>Crear cuenta</button>
            </div>
            {pestana === 'login' ? <FormularioLogin /> : <FormularioRegistro />}
          </div>
        </div>
      </section>
    </main>
  )
}
