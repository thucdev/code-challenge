import { Router } from "express";
import { HttpError } from "../errors";
import type { ResourceRepository } from "./resource.repository";
import {
  createResourceSchema,
  idParamSchema,
  listResourcesQuerySchema,
  updateResourceSchema,
} from "./resource.schema";

export function createResourceRouter(repo: ResourceRepository): Router {
  const router = Router();

  router.post("/", (req, res) => {
    const input = createResourceSchema.parse(req.body);
    res.status(201).json(repo.create(input));
  });

  router.get("/", (req, res) => {
    const query = listResourcesQuerySchema.parse(req.query);
    const { items, total } = repo.list(query);
    res.json({ data: items, meta: { total, limit: query.limit, offset: query.offset } });
  });

  router.get("/:id", (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const resource = repo.findById(id);
    if (!resource) throw new HttpError(404, `Resource ${id} not found`);
    res.json(resource);
  });

  router.patch("/:id", (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateResourceSchema.parse(req.body);
    const resource = repo.update(id, input);
    if (!resource) throw new HttpError(404, `Resource ${id} not found`);
    res.json(resource);
  });

  router.delete("/:id", (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    if (!repo.delete(id)) throw new HttpError(404, `Resource ${id} not found`);
    res.status(204).end();
  });

  return router;
}
