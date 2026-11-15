# ♻️ EcoPuntos

Plataforma ciudadana para cuidar el medio ambiente: **recicla**, **reporta problemas ambientales** y **gana puntos** canjeables por recompensas.

Proyecto PPI · Programación Web · I.U. Pascual Bravo · 2026 · Grupo 051
Integrantes: Juan Manuel Gonzalez Mejia, Emmanuel Isaza y Michael Gonzalez Vahos
Docente: Julio Cesar Martinez Zarate

| Laboratorio | Qué contiene | Dónde |
| --- | --- | --- |
| II | Frontend en React con LocalStorage | Etiqueta [`laboratorio-2`](../../tree/laboratorio-2) |
| III | Backend en Node.js + MongoDB Atlas, integrado con el frontend | Rama `main` (esta versión) |

## Arquitectura

```
Navegador ── React (Vite, puerto 5173) ── fetch + JWT ──▶ API Express (puerto 4000) ──▶ MongoDB Atlas
```

- **Frontend** (raíz del repositorio): React 19, Vite, React Router, Context API y Tailwind CSS v4.
- **Backend** (carpeta [`backend/`](backend/)): Node.js, Express 5, Mongoose 9, JWT y bcrypt. Ver su [README](backend/README.md) con todos los endpoints.
- **Base de datos**: MongoDB Atlas, base `ecopuntos`.

## Cómo ejecutarlo

Se necesitan dos terminales.

**1. Backend**

```bash
cd backend
npm install
cp .env-example .env      # pega la URL de MongoDB Atlas y una clave JWT
npm run seed              # datos iniciales (solo la primera vez)
npm run dev               # http://localhost:4000/api
```

**2. Frontend** (desde la raíz del repositorio)

```bash
npm install
npm run dev               # http://localhost:5173
```

Si la API está en otra dirección, crea un archivo `.env` a partir de `.env.example` y cambia `VITE_API_URL`.

Cuentas de prueba (creadas por `npm run seed`):

| Rol | Correo | Contraseña |
|---|---|---|
| Ciudadano | juan@ecopuntos.co | juan123 |
| Administrador | admin@ecopuntos.co | admin123 |

## Rutas del frontend

| Ruta | Página | Acceso |
|---|---|---|
| `/login` | Inicio de sesión y registro | Pública |
| `/inicio` | Panel con puntos, kilos, CO₂, nivel y actividad | Privada |
| `/reciclar` | Registro de entregas de reciclaje | Privada |
| `/reportes` | Reportes ambientales (acepta `?estado=pendiente`) | Privada |
| `/recompensas` | Catálogo, canjes y creación de recompensas (admin) | Privada |
| `*` | Página no encontrada | Pública |

## Estructura del frontend

```
src/
├── main.jsx              Punto de entrada: Router + proveedores de contexto
├── App.jsx               Definición de rutas
├── services/api.js       Cliente de la API REST (fetch + token JWT)
├── hooks/useCargar.js    Carga de datos con estado de carga y error
├── context/
│   ├── AuthContext.jsx   Sesión (JWT), registro, login y resumen de puntos
│   └── UIContext.jsx     Notificaciones y ventana de confirmación
├── components/           Layout, Navbar, Footer, Campo, Cargando
├── data/catalogos.js     Íconos y nombres de materiales, categorías y estados
├── pages/                Login, Inicio, Reciclar, Reportes, Recompensas, NoEncontrada
└── utils/                Formatos, validaciones, estilos y vista previa de puntos
```

## Reglas de negocio

- Puntos por kilo: plástico 10, cartón y papel 5, vidrio 8, metal y latas 15, electrónicos 20.
- Un reporte ambiental da **20 puntos** cuando el administrador lo valida.
- No se puede canjear una recompensa sin puntos suficientes ni si está agotada.
- El saldo lo calcula el backend a partir de los movimientos (entregas + reportes validados − canjes).
- Niveles: Semilla (0), Brote (100), Árbol (300) y Bosque (700 puntos ganados).
