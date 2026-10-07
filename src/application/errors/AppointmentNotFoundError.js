class AppointmentNotFoundError extends Error {
  constructor(id) {
    super(`Agendamento "${id}" não encontrado.`);
    this.name = "AppointmentNotFoundError";
  }
}

module.exports = AppointmentNotFoundError;
