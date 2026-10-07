const assert = require("node:assert/strict");
const test = require("node:test");
const AppointmentConflictError = require("../../src/application/errors/AppointmentConflictError");
const AppointmentNotFoundError = require("../../src/application/errors/AppointmentNotFoundError");
const CreateAppointment = require("../../src/application/use-cases/CreateAppointment");
const DeleteAppointment = require("../../src/application/use-cases/DeleteAppointment");
const GetAppointment = require("../../src/application/use-cases/GetAppointment");
const ListAppointments = require("../../src/application/use-cases/ListAppointments");
const UpdateAppointment = require("../../src/application/use-cases/UpdateAppointment");
const Appointment = require("../../src/domain/Appointment");
const ValidationError = require("../../src/domain/errors/ValidationError");
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

function input(overrides = {}) {
  return {
    clientName: "Ana Silva",
    service: "Consulta",
    appointmentDate: dateOffset(2),
    appointmentTime: "14:30",
    notes: "",
    ...overrides,
  };
}

function storedAppointment(id, overrides = {}) {
  return new Appointment({
    id,
    ...input(),
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    ...overrides,
  });
}

test("CreateAppointment assigns a UUID and timestamps", async () => {
  const repository = new InMemoryAppointmentRepository();
  const useCase = new CreateAppointment(repository);
  const created = await useCase.execute(input());

  assert.match(created.id, /^[0-9a-f-]{36}$/i);
  assert.equal(created.createdAt, created.updatedAt);
  assert.equal(await repository.findById(created.id), created);
});

test("CreateAppointment rejects a past appointment", async () => {
  const useCase = new CreateAppointment(new InMemoryAppointmentRepository());
  await assert.rejects(
    useCase.execute(input({ appointmentDate: dateOffset(-1) })),
    ValidationError,
  );
});

test("CreateAppointment rejects a time already in use", async () => {
  const repository = new InMemoryAppointmentRepository();
  const useCase = new CreateAppointment(repository);
  await useCase.execute(input());
  await assert.rejects(useCase.execute(input()), AppointmentConflictError);
});

test("GetAppointment returns a record or reports not found", async () => {
  const repository = new InMemoryAppointmentRepository();
  const appointment = storedAppointment("known-id");
  await repository.create(appointment);
  const useCase = new GetAppointment(repository);

  assert.equal(await useCase.execute("known-id"), appointment);
  await assert.rejects(useCase.execute("missing-id"), AppointmentNotFoundError);
});

test("ListAppointments sorts by date and time ascending", async () => {
  const repository = new InMemoryAppointmentRepository();
  const later = storedAppointment("later", {
    appointmentDate: dateOffset(2),
    appointmentTime: "15:00",
  });
  const earlier = storedAppointment("earlier", {
    appointmentDate: dateOffset(1),
    appointmentTime: "16:00",
  });
  const sameDayEarlier = storedAppointment("same-day-earlier", {
    appointmentDate: dateOffset(1),
    appointmentTime: "09:00",
  });
  await repository.create(later);
  await repository.create(earlier);
  await repository.create(sameDayEarlier);

  const result = await new ListAppointments(repository).execute();
  assert.deepEqual(
    result.map((appointment) => appointment.id),
    ["same-day-earlier", "earlier", "later"],
  );
});

test("UpdateAppointment preserves creation time and ignores its own slot", async () => {
  const repository = new InMemoryAppointmentRepository();
  const existing = storedAppointment("existing-id");
  await repository.create(existing);
  const updated = await new UpdateAppointment(repository).execute(
    existing.id,
    input({ clientName: "  Ana Atualizada  " }),
  );

  assert.equal(updated.id, existing.id);
  assert.equal(updated.clientName, "Ana Atualizada");
  assert.equal(updated.createdAt, existing.createdAt);
  assert.notEqual(updated.updatedAt, existing.updatedAt);
});

test("UpdateAppointment rejects another record's slot and missing records", async () => {
  const repository = new InMemoryAppointmentRepository();
  const first = storedAppointment("first-id");
  const second = storedAppointment("second-id", {
    appointmentDate: dateOffset(3),
    appointmentTime: "10:00",
  });
  await repository.create(first);
  await repository.create(second);

  await assert.rejects(
    new UpdateAppointment(repository).execute(first.id, {
      ...input(),
      appointmentDate: second.appointmentDate,
      appointmentTime: second.appointmentTime,
    }),
    AppointmentConflictError,
  );
  await assert.rejects(
    new UpdateAppointment(repository).execute("missing-id", input()),
    AppointmentNotFoundError,
  );
});

test("UpdateAppointment rejects a past date and time", async () => {
  const repository = new InMemoryAppointmentRepository();
  const existing = storedAppointment("past-update-id");
  await repository.create(existing);

  await assert.rejects(
    new UpdateAppointment(repository).execute(
      existing.id,
      input({ appointmentDate: dateOffset(-1) }),
    ),
    ValidationError,
  );
  assert.equal(
    (await repository.findById(existing.id)).appointmentDate,
    existing.appointmentDate,
  );
});

test("DeleteAppointment removes an existing record and rejects a missing one", async () => {
  const repository = new InMemoryAppointmentRepository();
  const appointment = storedAppointment("delete-id");
  await repository.create(appointment);
  const useCase = new DeleteAppointment(repository);

  await useCase.execute(appointment.id);
  assert.equal(await repository.findById(appointment.id), null);
  await assert.rejects(
    useCase.execute(appointment.id),
    AppointmentNotFoundError,
  );
});
