const dotenv = require("dotenv");
const createApp = require("./app");

function startServer() {
  dotenv.config();
  const app = createApp();
  const port = Number(process.env.PORT) || 3000;
  return app.listen(port, () => {
    console.log(`Servidor disponível em http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
