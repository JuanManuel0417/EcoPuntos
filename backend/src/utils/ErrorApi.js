// Error con código HTTP, para responder mensajes claros desde los controladores
class ErrorApi extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

module.exports = ErrorApi;
