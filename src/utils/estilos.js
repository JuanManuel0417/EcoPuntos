// Clase de un control de formulario según tenga o no error
export const claseCampo = (error, extra = '') => `campo ${error ? 'invalido' : ''} ${extra}`.trim()
