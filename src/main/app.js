const path = require("node:path");
const express = require("express");
const helmet = require("helmet");
const createCompositionRoot = require("./compositionRoot");
const {
  errorHandler,
  notFoundHandler,
} = require("../presentation/middlewares/errorHandler");
const createAppointmentRoutes = require("../presentation/routes/appointmentRoutes");

function createApp(options = {}) {
  const composition = options.controller
    ? options
    : createCompositionRoot(options);
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", path.resolve(__dirname, "../../views"));
  app.use(helmet());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.resolve(__dirname, "../../public")));
  app.get("/", (_request, response) => {
    response.redirect("/appointments");
  });
  app.use(createAppointmentRoutes(composition.controller));
  app.use(notFoundHandler);
  app.use(errorHandler);
  app.locals.database = composition.database;

  return app;
}

module.exports = createApp;
