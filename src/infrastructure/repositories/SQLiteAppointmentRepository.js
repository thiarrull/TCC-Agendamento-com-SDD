const Appointment = require("../../domain/Appointment");
const AppointmentConflictError = require("../../application/errors/AppointmentConflictError");
const AppointmentRepository = require("../../application/repositories/AppointmentRepository");

function mapRow(row) {
  if (!row) {
    return null;
  }

  return new Appointment({
    id: row.id,
    clientName: row.client_name,
    service: row.service,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function isAppointmentUniqueConstraint(error) {
  return (
    error.code === "SQLITE_CONSTRAINT_UNIQUE" &&
    error.message.includes("appointment_date") &&
    error.message.includes("appointment_time")
  );
}

class SQLiteAppointmentRepository extends AppointmentRepository {
  constructor(database) {
    super();
    this.database = database;
  }

  create(appointment) {
    try {
      this.database
        .prepare(
          `INSERT INTO appointments (
            id, client_name, service, appointment_date, appointment_time,
            notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          appointment.id,
          appointment.clientName,
          appointment.service,
          appointment.appointmentDate,
          appointment.appointmentTime,
          appointment.notes,
          appointment.createdAt,
          appointment.updatedAt,
        );
    } catch (error) {
      if (isAppointmentUniqueConstraint(error)) {
        throw new AppointmentConflictError();
      }
      throw error;
    }

    return appointment;
  }

  findById(id) {
    const row = this.database
      .prepare("SELECT * FROM appointments WHERE id = ?")
      .get(id);
    return mapRow(row);
  }

  findAll() {
    const rows = this.database
      .prepare(
        "SELECT * FROM appointments ORDER BY appointment_date ASC, appointment_time ASC",
      )
      .all();
    return rows.map(mapRow);
  }

  findByDateAndTime(appointmentDate, appointmentTime, excludeId = null) {
    const row = this.database
      .prepare(
        `SELECT * FROM appointments
         WHERE appointment_date = ? AND appointment_time = ?
         AND (? IS NULL OR id != ?)
         LIMIT 1`,
      )
      .get(appointmentDate, appointmentTime, excludeId, excludeId);
    return mapRow(row);
  }

  update(appointment) {
    try {
      this.database
        .prepare(
          `UPDATE appointments SET
            client_name = ?, service = ?, appointment_date = ?, appointment_time = ?,
            notes = ?, updated_at = ?
          WHERE id = ?`,
        )
        .run(
          appointment.clientName,
          appointment.service,
          appointment.appointmentDate,
          appointment.appointmentTime,
          appointment.notes,
          appointment.updatedAt,
          appointment.id,
        );
    } catch (error) {
      if (isAppointmentUniqueConstraint(error)) {
        throw new AppointmentConflictError();
      }
      throw error;
    }

    return appointment;
  }

  deleteById(id) {
    const result = this.database
      .prepare("DELETE FROM appointments WHERE id = ?")
      .run(id);
    return result.changes > 0;
  }
}

module.exports = SQLiteAppointmentRepository;
