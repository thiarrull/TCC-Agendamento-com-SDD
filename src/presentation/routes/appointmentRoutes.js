const express = require("express");

function createAppointmentRoutes(controller) {
  const router = express.Router();

  router.get("/appointments", controller.index.bind(controller));
  router.get("/appointments/new", controller.new.bind(controller));
  router.post("/appointments", controller.create.bind(controller));
  router.get("/appointments/:id/edit", controller.edit.bind(controller));
  router.post("/appointments/:id/update", controller.update.bind(controller));
  router.post("/appointments/:id/delete", controller.delete.bind(controller));
  router.get("/appointments/:id", controller.show.bind(controller));

  return router;
}

module.exports = createAppointmentRoutes;
