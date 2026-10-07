class AppointmentConflictError extends Error {
  constructor() {
    super("Já existe um agendamento nesta data e horário.");
    this.name = "AppointmentConflictError";
  }
}

module.exports = AppointmentConflictError;
