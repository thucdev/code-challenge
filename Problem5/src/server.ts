import { createApp } from "./app";
import { config } from "./config";
import { createDatabase } from "./db";

const db = createDatabase(config.dbPath);
const app = createApp(db);

const server = app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
  console.log(`Using SQLite database at ${config.dbPath}`);
});

function shutdown(): void {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
