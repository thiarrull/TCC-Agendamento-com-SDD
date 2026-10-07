const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const createDatabase = require("../../src/infrastructure/database/database");

test("database initialization creates its directory and schema automatically", (context) => {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(__dirname, "../../data/.database-init-"),
  );
  context.after(() => {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  const databaseFile = path.join(
    temporaryDirectory,
    "nested",
    "appointments.db",
  );
  const database = createDatabase(databaseFile);
  context.after(() => {
    database.close();
  });

  const appointmentTable = database
    .prepare("SELECT name FROM sqlite_master WHERE type = ? AND name = ?")
    .get("table", "appointments");

  assert.deepEqual(appointmentTable, { name: "appointments" });
  assert.equal(fs.existsSync(databaseFile), true);
});
