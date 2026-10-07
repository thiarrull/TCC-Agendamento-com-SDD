class ListAppointments {
  constructor(repository) {
    this.repository = repository;
  }

  async execute() {
    const appointments = await this.repository.findAll();
    return appointments.sort((first, second) =>
      `${first.appointmentDate} ${first.appointmentTime}`.localeCompare(
        `${second.appointmentDate} ${second.appointmentTime}`,
      ),
    );
  }
}

module.exports = ListAppointments;
