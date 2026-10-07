const AppointmentNotFoundError = require("../errors/AppointmentNotFoundError");

class GetAppointment {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id) {
    const appointment = await this.repository.findById(id);
    if (!appointment) {
      throw new AppointmentNotFoundError(id);
    }
    return appointment;
  }
}

module.exports = GetAppointment;
