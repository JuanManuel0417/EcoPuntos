// Datos de ejemplo con los que arranca la aplicación la primera vez

function diasAtras(dias) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - dias)
  return fecha.toISOString()
}

export function datosIniciales(version) {
  return {
    version,
    // Cuentas de prueba. En el Laboratorio III las contraseñas se guardarán cifradas (bcrypt).
    usuarios: [
      { id: 'u1', nombre: 'Administrador EcoPuntos', correo: 'admin@ecopuntos.co', password: 'admin123', rol: 'admin', creado: diasAtras(60) },
      { id: 'u2', nombre: 'Juan Manuel González', correo: 'juan@ecopuntos.co', password: 'juan123', rol: 'ciudadano', creado: diasAtras(30) },
    ],
    entregas: [
      { id: 'e1', usuarioId: 'u2', materialId: 'plastico', kg: 4.5, puntoId: 'pa1', puntos: 45, observaciones: 'Botellas PET limpias', fecha: diasAtras(20) },
      { id: 'e2', usuarioId: 'u2', materialId: 'carton', kg: 8, puntoId: 'pa2', puntos: 40, observaciones: '', fecha: diasAtras(12) },
      { id: 'e3', usuarioId: 'u2', materialId: 'metal', kg: 2, puntoId: 'pa1', puntos: 30, observaciones: 'Latas de aluminio', fecha: diasAtras(4) },
    ],
    reportes: [
      {
        id: 'r1', usuarioId: 'u2', categoriaId: 'basuras', titulo: 'Basuras acumuladas en la esquina del parque',
        ubicacion: 'Carrera 80 con Calle 70, Robledo',
        descripcion: 'Hace más de una semana hay bolsas de basura acumuladas junto al parque infantil. Hay malos olores y presencia de roedores.',
        foto: '', estado: 'en_proceso', fecha: diasAtras(15),
      },
      {
        id: 'r2', usuarioId: 'u2', categoriaId: 'vertimiento', titulo: 'Agua con espuma en la quebrada',
        ubicacion: 'Quebrada La Iguaná, sector puente peatonal',
        descripcion: 'Se observa espuma blanca y mal olor en el agua de la quebrada, posiblemente por vertimientos de alguna empresa cercana.',
        foto: '', estado: 'pendiente', fecha: diasAtras(2),
      },
    ],
    recompensas: [
      { id: 'p1', nombre: 'Café gratis', descripcion: 'Un café en la cafetería del campus.', icono: '☕', costo: 50, stock: 20 },
      { id: 'p2', nombre: 'Bolsa de tela ecológica', descripcion: 'Bolsa reutilizable para tus compras.', icono: '👜', costo: 80, stock: 15 },
      { id: 'p3', nombre: 'Kit de semillas', descripcion: 'Semillas para iniciar tu huerta en casa.', icono: '🌱', costo: 120, stock: 12 },
      { id: 'p4', nombre: 'Botella reutilizable', descripcion: 'Botella de acero inoxidable de 750 ml.', icono: '🥤', costo: 150, stock: 10 },
      { id: 'p5', nombre: '20% de descuento', descripcion: 'Bono de descuento en una tienda aliada.', icono: '🏷️', costo: 200, stock: 8 },
      { id: 'p6', nombre: 'Entrada a cine', descripcion: 'Una entrada para cualquier función 2D.', icono: '🎬', costo: 300, stock: 5 },
    ],
    canjes: [],
  }
}
