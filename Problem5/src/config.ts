import path from "node:path";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  dbPath: process.env.DB_PATH ?? path.resolve(process.cwd(), "data", "app.db"),
};
