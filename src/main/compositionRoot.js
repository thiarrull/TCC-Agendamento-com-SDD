const CreateAppointment = require("../application/use-cases/CreateAppointment");
const DeleteAppointment = require("../application/use-cases/DeleteAppointment");
const GetAppointment = require("../application/use-cases/GetAppointment");
const ListAppointments = require("../application/use-cases/ListAppointments");
const UpdateAppointment = require("../application/use-cases/UpdateAppointment");
const createDatabase = require("../infrastructure/database/database");
const SQLiteAppointmentRepository = require("../infrastructure/repositories/SQLiteAppointmentRepository");
const AppointmentController = require("../presentation/controllers/AppointmentController");

function createCompositionRoot({
  databaseFile,
  database: providedDatabase,
} = {}) {
  const database = providedDatabase || createDatabase(databaseFile);
  const repository = new SQLiteAppointmentRepository(database);
  const controller = new AppointmentController({
    createAppointment: new CreateAppointment(repository),
    getAppointment: new GetAppointment(repository),
    listAppointments: new ListAppointments(repository),
    updateAppointment: new UpdateAppointment(repository),
    deleteAppointment: new DeleteAppointment(repository),
  });

  return { database, repository, controller };
}

module.exports = createCompositionRoot;
