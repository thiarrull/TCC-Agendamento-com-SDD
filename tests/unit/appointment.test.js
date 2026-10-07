const assert = require("node:assert/strict");
const test = require("node:test");
const Appointment = require("../../src/domain/Appointment");
const ValidationError = require("../../src/domain/errors/ValidationError");

function dateOffset(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function validAppointment(overrides = {}) {
  return new Appointment({
    id: "appointment-id",
    clientName: "Cliente",
    service: "Consulta",
    appointmentDate: dateOffset(1),
    appointmentTime: "14:30",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });
}

test("Appointment trims the client name", () => {
  const appointment = validAppointment({ clientName: "  Ana Silva  " });
  assert.equal(appointment.clientName, "Ana Silva");
});

test("Appointment rejects missing required fields", () => {
  assert.throws(() => validAppointment({ clientName: "   " }), ValidationError);
  assert.throws(() => validAppointment({ service: "" }), ValidationError);
  assert.throws(
    () => validAppointment({ appointmentDate: "" }),
    ValidationError,
  );
  assert.throws(
    () => validAppointment({ appointmentTime: "" }),
    ValidationError,
  );
});

test("Appointment rejects malformed or impossible dates", () => {
  assert.throws(
    () => validAppointment({ appointmentDate: "2026-02-30" }),
    ValidationError,
  );
  assert.throws(
    () => validAppointment({ appointmentDate: "07/10/2026" }),
    ValidationError,
  );
});

test("Appointment rejects malformed or out-of-range times", () => {
  assert.throws(
    () => validAppointment({ appointmentTime: "24:00" }),
    ValidationError,
  );
  assert.throws(
    () => validAppointment({ appointmentTime: "9:30" }),
    ValidationError,
  );
});

test("Appointment limits notes to 500 characters", () => {
  assert.equal(validAppointment({ notes: "a".repeat(500) }).notes.length, 500);
  assert.throws(
    () => validAppointment({ notes: "a".repeat(501) }),
    ValidationError,
  );
});

test("Appointment identifies a past local date and time", () => {
  assert.equal(Appointment.isInPast(dateOffset(-1), "12:00"), true);
  assert.equal(Appointment.isInPast(dateOffset(1), "12:00"), false);
});
