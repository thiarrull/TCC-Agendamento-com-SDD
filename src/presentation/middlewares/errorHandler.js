const AppointmentConflictError = require("../../application/errors/AppointmentConflictError");
const AppointmentNotFoundError = require("../../application/errors/AppointmentNotFoundError");
const ValidationError = require("../../domain/errors/ValidationError");

function notFoundHandler(_request, response) {
  response.status(404).render("404");
}

function errorHandler(error, _request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  let statusCode = 500;
  let message = "Ocorreu um erro inesperado. Tente novamente.";
  let view = "error";
  let viewData = { message };

  if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.message;
    viewData = { message };
  } else if (error instanceof AppointmentNotFoundError) {
    statusCode = 404;
    view = "404";
    viewData = {};
  } else if (error instanceof AppointmentConflictError) {
    statusCode = 409;
    message = error.message;
    viewData = { message };
  } else {
    console.error(error);
  }

  response.status(statusCode).render(view, viewData);
}

module.exports = { errorHandler, notFoundHandler };
