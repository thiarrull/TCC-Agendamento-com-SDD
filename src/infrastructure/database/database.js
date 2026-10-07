const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const schemaFile = path.join(__dirname, "schema.sql");

function createDatabase(
  databaseFile = process.env.DATABASE_FILE || "./data/appointments.db",
) {
  const databasePath =
    databaseFile === ":memory:" ? databaseFile : path.resolve(databaseFile);

  if (databasePath !== ":memory:") {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const database = new Database(databasePath);
  const schema = fs.readFileSync(schemaFile, "utf8");
  database.exec(schema);
  return database;
}

module.exports = createDatabase;
