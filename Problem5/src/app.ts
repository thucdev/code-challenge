import express, { type Express } from "express";
import type { DB } from "./db";
import { errorHandler, notFoundHandler } from "./errors";
import { ResourceRepository } from "./resources/resource.repository";
import { createResourceRouter } from "./resources/resource.router";

export function createApp(db: DB): Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/resources", createResourceRouter(new ResourceRepository(db)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
