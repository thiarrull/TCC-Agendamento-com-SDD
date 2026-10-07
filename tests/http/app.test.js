const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const test = require("node:test");
const {
  errorHandler,
} = require("../../src/presentation/middlewares/errorHandler");

test("app module exports an Express application factory without starting a server", async (context) => {
  const createApp = require("../../src/main/app");
  const { startServer } = require("../../src/main/server");
  const app = createApp({ databaseFile: ":memory:" });
  context.after(() => app.locals.database.close());

  assert.equal(typeof app, "function");
  assert.equal(typeof startServer, "function");

  const response = await request(app).get("/");
  assert.equal(response.status, 302);
  assert.equal(response.headers.location, "/appointments");
});

test("app serves responsive styles and delete confirmation script", async (context) => {
  const createApp = require("../../src/main/app");
  const app = createApp({ databaseFile: ":memory:" });
  context.after(() => app.locals.database.close());

  const styles = await request(app).get("/css/styles.css");
  assert.equal(styles.status, 200);
  assert.match(styles.text, /:focus-visible/);
  assert.match(styles.text, /@media \(max-width: 640px\)/);
  assert.match(styles.text, /overflow-x: auto/);

  const script = await request(app).get("/js/app.js");
  assert.equal(script.status, 200);
  assert.match(script.text, /window\.confirm/);
  assert.match(
    script.text,
    /Tem certeza que deseja excluir este agendamento\?/,
  );
});

test("unexpected errors return a generic 500 without exposing internal details", async () => {
  const app = express();
  app.set("view engine", "ejs");
  app.set("views", require("node:path").join(__dirname, "../../views"));
  app.get("/failure", (_request, _response, next) => {
    next(new Error("SQLITE failure at /private/database/path"));
  });
  app.use(errorHandler);

  const originalConsoleError = console.error;
  let loggedError;
  console.error = (error) => {
    loggedError = error;
  };

  let response;
  try {
    response = await request(app).get("/failure");
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(response.status, 500);
  assert.match(response.text, /erro inesperado/i);
  assert.doesNotMatch(response.text, /SQLITE|\/private\/database\/path|Error:/);
  assert.match(loggedError.message, /SQLITE failure/);
});
