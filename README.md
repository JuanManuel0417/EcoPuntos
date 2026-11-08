# ♻️ EcoPuntos: Frontend en React (Laboratorio II)

Plataforma ciudadana para cuidar el medio ambiente: **recicla**, **reporta problemas ambientales** y **gana puntos** canjeables por recompensas.

Proyecto PPI · Programación Web · I.U. Pascual Bravo · 2026 · Grupo 051
Integrantes: Juan Manuel Gonzalez Mejia, Emmanuel Isaza y Michael Gonzalez Vahos
Docente: Julio Cesar Martinez Zarate

## Tecnologías

- **React 19** con **Vite** como herramienta de desarrollo y empaquetado.
- **React Router** para las rutas y la protección de páginas privadas.
- **Tailwind CSS v4** (plugin `@tailwindcss/vite`) para los estilos.
- **LocalStorage** del navegador para simular la base de datos. En el Laboratorio III se reemplazará por una API con Node.js y MongoDB.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>. Para generar la versión de producción usa `npm run build`.

Cuentas de prueba:

| Rol | Correo | Contraseña |
|---|---|---|
| Ciudadano | juan@ecopuntos.co | juan123 |
| Administrador | admin@ecopuntos.co | admin123 |

## Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/login` | Inicio de sesión y registro | Pública |
| `/inicio` | Panel con puntos, kilos, CO₂, nivel y actividad | Privada |
| `/reciclar` | Registro de entregas de reciclaje | Privada |
| `/reportes` | Reportes ambientales (acepta `?estado=pendiente`) | Privada |
| `/recompensas` | Catálogo, canjes y creación de recompensas (admin) | Privada |
| `*` | Página no encontrada | Pública |

## Estructura de carpetas

```
src/
├── main.jsx              # Punto de entrada: Router + proveedores de contexto
├── App.jsx               # Definición de rutas
├── index.css             # Tailwind y componentes de estilo propios
├── components/           # Componentes reutilizables
│   ├── Layout.jsx        # Plantilla de páginas privadas (protege las rutas)
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── Campo.jsx         # Etiqueta + control + mensaje de error
├── context/
│   ├── AuthContext.jsx   # Sesión, login, registro y resumen de puntos
│   └── UIContext.jsx     # Notificaciones y ventana de confirmación
├── data/
│   ├── catalogos.js      # Materiales, puntos de acopio, categorías, niveles
│   ├── semilla.js        # Datos de ejemplo iniciales
│   └── db.js             # Servicio de datos sobre LocalStorage
├── pages/                # Una página por ruta
│   ├── Login.jsx
│   ├── Inicio.jsx
│   ├── Reciclar.jsx
│   ├── Reportes.jsx
│   ├── Recompensas.jsx
│   └── NoEncontrada.jsx
└── utils/                # Formatos, validaciones y estilos de campos
```

## Reglas de negocio

- Puntos por kilo: plástico 10, cartón y papel 5, vidrio 8, metal y latas 15, electrónicos 20.
- Un reporte ambiental da **20 puntos** cuando el administrador lo valida.
- No se puede canjear una recompensa sin puntos suficientes ni si está agotada.
- El saldo se calcula a partir de los movimientos (entregas + reportes validados − canjes).
- Niveles: Semilla (0), Brote (100), Árbol (300) y Bosque (700 puntos ganados).
