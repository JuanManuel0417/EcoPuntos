// Validaciones reutilizables para los formularios

export const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Valida un objeto de valores con reglas por campo.
 * reglas = { campo: (valor, valores) => 'mensaje de error' | '' }
 * Devuelve un objeto solo con los campos que tienen error.
 */
export function validar(valores, reglas) {
  const errores = {}
  Object.entries(reglas).forEach(([campo, regla]) => {
    const valor = typeof valores[campo] === 'string' ? valores[campo].trim() : valores[campo]
    const mensaje = regla(valor, valores)
    if (mensaje) errores[campo] = mensaje
  })
  return errores
}

export function validarCorreo(valor) {
  if (!valor) return 'Escribe tu correo.'
  if (!REGEX_CORREO.test(valor)) return 'El correo no tiene un formato válido.'
  return ''
}

export function validarEntero(valor, minimo, maximo, nombre) {
  const numero = Number(valor)
  if (valor === '' || valor === undefined) return `Escribe ${nombre}.`
  if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
    return `Debe ser un número entero entre ${minimo} y ${maximo}.`
  }
  return ''
}
