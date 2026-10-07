const AppointmentNotFoundError = require("../errors/AppointmentNotFoundError");

class DeleteAppointment {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id) {
    const appointment = await this.repository.findById(id);
    if (!appointment) {
      throw new AppointmentNotFoundError(id);
    }
    await this.repository.deleteById(id);
  }
}

module.exports = DeleteAppointment;
