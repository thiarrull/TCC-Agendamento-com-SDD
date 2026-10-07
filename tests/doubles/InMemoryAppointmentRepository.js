class InMemoryAppointmentRepository {
  constructor() {
    this.appointments = new Map();
  }

  async create(appointment) {
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  async findById(id) {
    return this.appointments.get(id) ?? null;
  }

  async findAll() {
    return [...this.appointments.values()];
  }

  async findByDateAndTime(appointmentDate, appointmentTime, excludeId = null) {
    return (
      [...this.appointments.values()].find(
        (appointment) =>
          appointment.id !== excludeId &&
          appointment.appointmentDate === appointmentDate &&
          appointment.appointmentTime === appointmentTime,
      ) ?? null
    );
  }

  async update(appointment) {
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  async deleteById(id) {
    return this.appointments.delete(id);
  }
}

module.exports = InMemoryAppointmentRepository;
