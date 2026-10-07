const { randomUUID } = require("node:crypto");
const Appointment = require("../../domain/Appointment");
const ValidationError = require("../../domain/errors/ValidationError");
const AppointmentConflictError = require("../errors/AppointmentConflictError");

class CreateAppointment {
  constructor(
    repository,
    { clock = () => new Date(), createId = randomUUID } = {},
  ) {
    this.repository = repository;
    this.clock = clock;
    this.createId = createId;
  }

  async execute(input) {
    const now = this.clock();
    const appointment = new Appointment({
      ...input,
      id: this.createId(),
      createdAt: now.toISOString(),
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

    const existing = await this.repository.findByDateAndTime(
      appointment.appointmentDate,
      appointment.appointmentTime,
    );
    if (existing) {
      throw new AppointmentConflictError();
    }

    return this.repository.create(appointment);
  }
}

module.exports = CreateAppointment;
