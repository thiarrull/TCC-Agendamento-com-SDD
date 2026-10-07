const assert = require("node:assert/strict");
const test = require("node:test");
const AppointmentConflictError = require("../../src/application/errors/AppointmentConflictError");
const Appointment = require("../../src/domain/Appointment");
const createDatabase = require("../../src/infrastructure/database/database");
const SQLiteAppointmentRepository = require("../../src/infrastructure/repositories/SQLiteAppointmentRepository");

function dateOffset(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function appointment(id, overrides = {}) {
  return new Appointment({
    id,
    clientName: "Ana Silva",
    service: "Consulta",
    appointmentDate: dateOffset(1),
    appointmentTime: "14:30",
    notes: "",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    ...overrides,
  });
}

function repositoryFor(context) {
  const database = createDatabase(":memory:");
  context.after(() => database.close());
  return new SQLiteAppointmentRepository(database);
}

test("SQLite repository creates and finds appointments by ID", (context) => {
  const repository = repositoryFor(context);
  const record = appointment("one");

  assert.equal(repository.create(record), record);
  assert.deepEqual(repository.findById("one"), record);
  assert.equal(repository.findById("missing"), null);
});

test("SQLite repository lists appointments by date and time ascending", (context) => {
  const repository = repositoryFor(context);
  const later = appointment("later", {
    appointmentDate: dateOffset(2),
    appointmentTime: "15:00",
  });
  const earlierTime = appointment("earlier-time", {
    appointmentTime: "09:00",
  });
  const earlierDate = appointment("earlier-date", {
    appointmentDate: dateOffset(0),
    appointmentTime: "16:00",
  });
  repository.create(later);
  repository.create(earlierTime);
  repository.create(earlierDate);

  assert.deepEqual(
    repository.findAll().map((record) => record.id),
    ["earlier-date", "earlier-time", "later"],
  );
});

test("SQLite repository checks a slot and can exclude the current record", (context) => {
  const repository = repositoryFor(context);
  const record = appointment("one");
  repository.create(record);

  assert.equal(
    repository.findByDateAndTime(record.appointmentDate, record.appointmentTime)
      .id,
    record.id,
  );
  assert.equal(
    repository.findByDateAndTime(
      record.appointmentDate,
      record.appointmentTime,
      record.id,
    ),
    null,
  );
});

test("SQLite unique constraint rejects duplicate date and time", (context) => {
  const repository = repositoryFor(context);
  repository.create(appointment("first"));

  assert.throws(
    () => repository.create(appointment("duplicate")),
    AppointmentConflictError,
  );
});

test("SQLite repository updates and deletes appointments", (context) => {
  const repository = repositoryFor(context);
  const original = appointment("one");
  repository.create(original);
  const updated = appointment("one", {
    clientName: "Nome Atualizado",
    appointmentDate: dateOffset(2),
    updatedAt: "2026-01-02T10:00:00.000Z",
  });

  assert.equal(repository.update(updated), updated);
  assert.deepEqual(repository.findById("one"), updated);
  assert.equal(repository.deleteById("one"), true);
  assert.equal(repository.findById("one"), null);
  assert.equal(repository.deleteById("one"), false);
});
