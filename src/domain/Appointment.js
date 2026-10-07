const ValidationError = require("./errors/ValidationError");

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTime(value) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

class Appointment {
  constructor({
    id,
    clientName,
    service,
    appointmentDate,
    appointmentTime,
    notes = "",
    createdAt,
    updatedAt,
  }) {
    if (typeof clientName !== "string" || !clientName.trim()) {
      throw new ValidationError("O nome do cliente é obrigatório.");
    }
    if (typeof service !== "string" || !service.trim()) {
      throw new ValidationError("O serviço é obrigatório.");
    }
    if (!isValidDate(appointmentDate)) {
      throw new ValidationError(
        "Informe uma data válida no formato YYYY-MM-DD.",
      );
    }
    if (!isValidTime(appointmentTime)) {
      throw new ValidationError("Informe um horário válido no formato HH:mm.");
    }
    if (typeof notes !== "string" || notes.length > 500) {
      throw new ValidationError(
        "As observações devem ter no máximo 500 caracteres.",
      );
    }

    this.id = id;
    this.clientName = clientName.trim();
    this.service = service.trim();
    this.appointmentDate = appointmentDate;
    this.appointmentTime = appointmentTime;
    this.notes = notes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static isInPast(appointmentDate, appointmentTime, now = new Date()) {
    if (!isValidDate(appointmentDate) || !isValidTime(appointmentTime)) {
      throw new ValidationError("Informe uma data e horário válidos.");
    }

    const [year, month, day] = appointmentDate.split("-").map(Number);
    const [hours, minutes] = appointmentTime.split(":").map(Number);
    const localAppointment = new Date(year, month - 1, day, hours, minutes);

    return localAppointment.getTime() < now.getTime();
  }
}

module.exports = Appointment;
