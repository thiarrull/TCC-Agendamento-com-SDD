const AppointmentConflictError = require("../../application/errors/AppointmentConflictError");
const AppointmentNotFoundError = require("../../application/errors/AppointmentNotFoundError");
const ValidationError = require("../../domain/errors/ValidationError");

class AppointmentController {
  constructor({
    createAppointment,
    getAppointment,
    listAppointments,
    updateAppointment,
    deleteAppointment,
  }) {
    this.createAppointment = createAppointment;
    this.getAppointment = getAppointment;
    this.listAppointments = listAppointments;
    this.updateAppointment = updateAppointment;
    this.deleteAppointment = deleteAppointment;
  }

  async index(_request, response, next) {
    try {
      const appointments = await this.listAppointments.execute();
      response.render("appointments/index", { appointments });
    } catch (error) {
      next(error);
    }
  }

  new(_request, response) {
    response.render("appointments/new", {
      appointment: {},
      error: null,
    });
  }

  async create(request, response, next) {
    try {
      const appointment = await this.createAppointment.execute(request.body);
      response.redirect(`/appointments/${appointment.id}`);
    } catch (error) {
      if (
        this.renderFormError(response, error, "appointments/new", request.body)
      ) {
        return;
      }
      next(error);
    }
  }

  async show(request, response, next) {
    try {
      const appointment = await this.getAppointment.execute(request.params.id);
      response.render("appointments/show", { appointment });
    } catch (error) {
      next(error);
    }
  }

  async edit(request, response, next) {
    try {
      const appointment = await this.getAppointment.execute(request.params.id);
      response.render("appointments/edit", { appointment, error: null });
    } catch (error) {
      next(error);
    }
  }

  async update(request, response, next) {
    try {
      const appointment = await this.updateAppointment.execute(
        request.params.id,
        request.body,
      );
      response.redirect(`/appointments/${appointment.id}`);
    } catch (error) {
      if (
        this.renderFormError(response, error, "appointments/edit", {
          ...request.body,
          id: request.params.id,
        })
      ) {
        return;
      }
      next(error);
    }
  }

  async delete(request, response, next) {
    try {
      await this.deleteAppointment.execute(request.params.id);
      response.redirect("/appointments");
    } catch (error) {
      next(error);
    }
  }

  renderFormError(response, error, view, appointment) {
    if (error instanceof ValidationError) {
      response.status(400).render(view, { appointment, error: error.message });
      return true;
    }
    if (error instanceof AppointmentConflictError) {
      response.status(409).render(view, { appointment, error: error.message });
      return true;
    }
    if (error instanceof AppointmentNotFoundError) {
      return false;
    }
    return false;
  }
}

module.exports = AppointmentController;
