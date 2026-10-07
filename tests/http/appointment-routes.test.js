const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const test = require("node:test");
const CreateAppointment = require("../../src/application/use-cases/CreateAppointment");
const DeleteAppointment = require("../../src/application/use-cases/DeleteAppointment");
const GetAppointment = require("../../src/application/use-cases/GetAppointment");
const ListAppointments = require("../../src/application/use-cases/ListAppointments");
const UpdateAppointment = require("../../src/application/use-cases/UpdateAppointment");
const AppointmentController = require("../../src/presentation/controllers/AppointmentController");
const {
  errorHandler,
  notFoundHandler,
} = require("../../src/presentation/middlewares/errorHandler");
const createAppointmentRoutes = require("../../src/presentation/routes/appointmentRoutes");
const InMemoryAppointmentRepository = require("../doubles/InMemoryAppointmentRepository");

function dateOffset(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function createTestApp() {
  const repository = new InMemoryAppointmentRepository();
  const controller = new AppointmentController({
    createAppointment: new CreateAppointment(repository),
    getAppointment: new GetAppointment(repository),
    listAppointments: new ListAppointments(repository),
    updateAppointment: new UpdateAppointment(repository),
    deleteAppointment: new DeleteAppointment(repository),
  });
  const app = express();
  app.set("view engine", "ejs");
  app.set("views", require("node:path").join(__dirname, "../../views"));
  app.use(express.urlencoded({ extended: false }));
  app.use(createAppointmentRoutes(controller));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

function validForm(overrides = {}) {
  return {
    clientName: "Ana Silva",
    service: "Consulta",
    appointmentDate: dateOffset(2),
    appointmentTime: "14:30",
    notes: "",
    ...overrides,
  };
}

test("appointment routes render empty and populated list, form, detail and edit pages", async () => {
  const app = createTestApp();
  const emptyList = await request(app).get("/appointments");
  assert.equal(emptyList.status, 200);
  assert.match(emptyList.text, /Nenhum agendamento encontrado/);

  const form = await request(app).get("/appointments/new");
  assert.equal(form.status, 200);
  assert.match(form.text, /<label for="clientName">/);
  assert.match(form.text, /name="appointmentDate" type="date"/);
  assert.match(form.text, /name="appointmentTime" type="time"/);
  assert.match(form.text, /maxlength="500"/);

  const created = await request(app)
    .post("/appointments")
    .type("form")
    .send(validForm());
  assert.equal(created.status, 302);
  const id = created.headers.location.split("/").at(-1);

  const detail = await request(app).get(`/appointments/${id}`);
  assert.equal(detail.status, 200);
  assert.match(detail.text, /Ana Silva/);
  assert.match(detail.text, /Excluir agendamento/);

  const edit = await request(app).get(`/appointments/${id}/edit`);
  assert.equal(edit.status, 200);
  assert.match(edit.text, /Salvar alterações/);

  const populatedList = await request(app).get("/appointments");
  assert.equal(populatedList.status, 200);
  assert.match(populatedList.text, /Ana Silva/);
  assert.match(populatedList.text, /Visualizar/);
  assert.match(populatedList.text, /Editar/);
  assert.match(populatedList.text, /Excluir/);
});

test("appointment routes report invalid, conflicting and missing resources", async () => {
  const app = createTestApp();
  const invalid = await request(app)
    .post("/appointments")
    .type("form")
    .send(validForm({ clientName: "" }));
  assert.equal(invalid.status, 400);
  assert.match(invalid.text, /nome do cliente/i);

  const first = await request(app)
    .post("/appointments")
    .type("form")
    .send(validForm());
  assert.equal(first.status, 302);
  const conflict = await request(app)
    .post("/appointments")
    .type("form")
    .send(validForm());
  assert.equal(conflict.status, 409);

  const notFound = await request(app).get("/appointments/missing-id");
  assert.equal(notFound.status, 404);
  assert.match(notFound.text, /Página não encontrada/);
  assert.equal(
    (await request(app).get("/appointments/missing-id/edit")).status,
    404,
  );
  assert.equal(
    (await request(app).post("/appointments/missing-id/delete")).status,
    404,
  );
});

test("appointment routes update and delete records", async () => {
  const app = createTestApp();
  const existingSlot = validForm();
  const otherSlot = validForm({
    appointmentDate: dateOffset(3),
    appointmentTime: "10:00",
  });
  const created = await request(app)
    .post("/appointments")
    .type("form")
    .send(existingSlot);
  const id = created.headers.location.split("/").at(-1);
  await request(app).post("/appointments").type("form").send(otherSlot);

  const conflictingUpdate = await request(app)
    .post(`/appointments/${id}/update`)
    .type("form")
    .send(otherSlot);
  assert.equal(conflictingUpdate.status, 409);

  const updated = await request(app)
    .post(`/appointments/${id}/update`)
    .type("form")
    .send(validForm({ clientName: "Ana Atualizada" }));
  assert.equal(updated.status, 302);
  assert.match(
    (await request(app).get(`/appointments/${id}`)).text,
    /Ana Atualizada/,
  );

  const deleted = await request(app).post(`/appointments/${id}/delete`);
  assert.equal(deleted.status, 302);
  assert.equal((await request(app).get(`/appointments/${id}`)).status, 404);
});
