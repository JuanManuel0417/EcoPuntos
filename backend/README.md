# ♻️ EcoPuntos: Backend (Laboratorio III)

API REST de EcoPuntos construida con **Node.js**, **Express** y **MongoDB Atlas** (Mongoose). Gestiona usuarios, entregas de reciclaje, reportes ambientales, puntos de acopio, recompensas y canjes.

Integrantes: Juan Manuel Gonzalez Mejia, Emmanuel Isaza y Michael Gonzalez Vahos · Grupo 051 · I.U. Pascual Bravo · 2026

## Tecnologías

| Paquete | Uso |
| --- | --- |
| `express` | Servidor web y rutas de la API |
| `mongoose` | Modelos y conexión con MongoDB Atlas |
| `dotenv` | Lee la configuración del archivo `.env` |
| `cors` | Permite que el frontend de React consuma la API |
| `bcryptjs` | Cifra las contraseñas de los usuarios |
| `jsonwebtoken` | Genera y verifica los tokens de sesión (JWT) |

## Cómo ejecutarlo

```bash
cd backend
npm install
cp .env-example .env      # luego pega la URL de MongoDB Atlas y una clave JWT
npm run seed              # carga los datos iniciales (borra los existentes)
npm run dev               # API en http://localhost:4000/api
```

Cuentas creadas por `npm run seed`:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Ciudadano | juan@ecopuntos.co | juan123 |
| Administrador | admin@ecopuntos.co | admin123 |

## Estructura

```
backend/
├── server.js                 Carga .env, conecta con MongoDB y abre el puerto
└── src/
    ├── app.js                Express: CORS, JSON, rutas y manejo de errores
    ├── config/
    │   ├── database.js       Conexión con MongoDB Atlas
    │   └── catalogos.js      Materiales, puntos por kilo, estados y niveles
    ├── models/               Esquemas de Mongoose
    │   ├── Usuario.js  PuntoAcopio.js  Entrega.js
    │   └── Reporte.js  Recompensa.js  Canje.js
    ├── controllers/          Lógica de cada módulo
    ├── routes/index.js       Rutas de la API (/api/...)
    ├── middlewares/
    │   ├── auth.js           Verifica el JWT y el rol de administrador
    │   └── errores.js        Respuestas de error en JSON
    ├── utils/
    │   ├── puntos.js         Cálculo de puntos, saldo y nivel
    │   └── ErrorApi.js       Error con código HTTP
    └── seed/seed.js          Datos iniciales
```

## Endpoints

Las rutas marcadas con 🔒 necesitan el encabezado `Authorization: Bearer <token>`. Las marcadas con 👑 son solo para administradores.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api` | Estado de la API |
| GET | `/api/catalogos` | Materiales, categorías, estados y niveles |
| POST | `/api/auth/registro` | Crea una cuenta de ciudadano y devuelve el token |
| POST | `/api/auth/login` | Inicia sesión y devuelve el token |
| GET | `/api/auth/perfil` 🔒 | Datos del usuario de la sesión |
| GET | `/api/resumen` 🔒 | Saldo, nivel, totales y actividad reciente |
| GET | `/api/puntos-acopio` 🔒 | Lista los puntos de acopio |
| POST | `/api/puntos-acopio` 🔒👑 | Crea un punto de acopio |
| DELETE | `/api/puntos-acopio/:id` 🔒👑 | Desactiva un punto de acopio |
| GET | `/api/entregas` 🔒 | Entregas del usuario |
| POST | `/api/entregas` 🔒 | Registra una entrega (el servidor calcula los puntos) |
| DELETE | `/api/entregas/:id` 🔒 | Elimina una entrega propia si sus puntos no se gastaron |
| GET | `/api/reportes` 🔒 | Lista todos los reportes ambientales |
| POST | `/api/reportes` 🔒 | Crea un reporte (siempre queda pendiente) |
| PATCH | `/api/reportes/:id/estado` 🔒👑 | Valida, resuelve, rechaza o reabre un reporte |
| DELETE | `/api/reportes/:id` 🔒 | Elimina un reporte propio pendiente |
| GET | `/api/recompensas` 🔒 | Catálogo de recompensas |
| POST | `/api/recompensas` 🔒👑 | Crea una recompensa |
| DELETE | `/api/recompensas/:id` 🔒👑 | Desactiva una recompensa |
| POST | `/api/recompensas/:id/canjear` 🔒 | Canjea una recompensa (valida saldo y stock) |
| GET | `/api/canjes` 🔒 | Canjes del usuario |

## Reglas de negocio

- Puntos por kilo: plástico 10, cartón y papel 5, vidrio 8, metal y latas 15, electrónicos 20.
- Un reporte da **20 puntos** cuando un administrador lo valida.
- El saldo se calcula en el servidor: entregas + reportes validados − canjes.
- No se puede canjear sin puntos suficientes ni si la recompensa está agotada (el stock se descuenta de forma atómica).
- Las contraseñas se guardan cifradas con bcrypt y nunca se devuelven en las respuestas.
