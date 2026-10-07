const Appointment = require("../../domain/Appointment");
const ValidationError = require("../../domain/errors/ValidationError");
const AppointmentConflictError = require("../errors/AppointmentConflictError");
const AppointmentNotFoundError = require("../errors/AppointmentNotFoundError");

class UpdateAppointment {
  constructor(repository, { clock = () => new Date() } = {}) {
    this.repository = repository;
    this.clock = clock;
  }

  async execute(id, input) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppointmentNotFoundError(id);
    }

    const now = this.clock();
    const appointment = new Appointment({
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now.toISOString(),
    });

    if (
      Appointment.isInPast(
        appointment.appointmentDate,
        appointment.appointmentTime,
        now,
      )
    ) {
      throw new ValidationError(
        "Não é possível agendar uma data e horário no passado.",
      );
    }

    const conflict = await this.repository.findByDateAndTime(
      appointment.appointmentDate,
      appointment.appointmentTime,
      appointment.id,
    );
    if (conflict) {
      throw new AppointmentConflictError();
    }

    return this.repository.update(appointment);
  }
}

module.exports = UpdateAppointment;
