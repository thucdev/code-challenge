import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { createDatabase, type DB } from "../src/db";

let db: DB;
let app: ReturnType<typeof createApp>;

beforeEach(() => {
  db = createDatabase(":memory:");
  app = createApp(db);
});

afterEach(() => {
  db.close();
});

async function seed(body: Record<string, unknown>) {
  const res = await request(app).post("/resources").send(body).expect(201);
  return res.body;
}

describe("POST /resources", () => {
  it("creates a resource with defaults", async () => {
    const created = await seed({ name: "Laptop", category: "electronics" });
    expect(created).toMatchObject({
      id: expect.any(Number),
      name: "Laptop",
      description: "",
      category: "electronics",
      status: "active",
    });
    expect(created.createdAt).toBe(created.updatedAt);
  });

  it("rejects invalid payloads", async () => {
    const res = await request(app)
      .post("/resources")
      .send({ name: "", status: "unknown" })
      .expect(400);
    const paths = res.body.error.details.map((d: { path: string }) => d.path);
    expect(paths).toEqual(expect.arrayContaining(["name", "category", "status"]));
  });

  it("rejects malformed JSON", async () => {
    await request(app)
      .post("/resources")
      .set("Content-Type", "application/json")
      .send("{bad json")
      .expect(400);
  });
});

describe("GET /resources", () => {
  beforeEach(async () => {
    await seed({ name: "Laptop", category: "electronics" });
    await seed({ name: "Phone", category: "electronics", status: "inactive" });
    await seed({ name: "Desk lamp", category: "furniture" });
  });

  it("lists all resources with pagination metadata", async () => {
    const res = await request(app).get("/resources").expect(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.meta).toEqual({ total: 3, limit: 20, offset: 0 });
  });

  it("filters by category, status and partial name", async () => {
    const byCategory = await request(app).get("/resources?category=electronics");
    expect(byCategory.body.data).toHaveLength(2);

    const byStatus = await request(app).get("/resources?status=inactive");
    expect(byStatus.body.data.map((r: { name: string }) => r.name)).toEqual(["Phone"]);

    const byName = await request(app).get("/resources?name=lam");
    expect(byName.body.data.map((r: { name: string }) => r.name)).toEqual(["Desk lamp"]);
  });

  it("sorts and paginates", async () => {
    const res = await request(app)
      .get("/resources?sortBy=name&order=asc&limit=2&offset=1")
      .expect(200);
    expect(res.body.data.map((r: { name: string }) => r.name)).toEqual(["Laptop", "Phone"]);
    expect(res.body.meta).toEqual({ total: 3, limit: 2, offset: 1 });
  });

  it("rejects invalid query parameters", async () => {
    await request(app).get("/resources?limit=0").expect(400);
    await request(app).get("/resources?status=bogus").expect(400);
  });
});

describe("GET /resources/:id", () => {
  it("returns the resource", async () => {
    const created = await seed({ name: "Laptop", category: "electronics" });
    const res = await request(app).get(`/resources/${created.id}`).expect(200);
    expect(res.body).toEqual(created);
  });

  it("returns 404 for unknown id and 400 for invalid id", async () => {
    await request(app).get("/resources/999").expect(404);
    await request(app).get("/resources/abc").expect(400);
  });
});

describe("PATCH /resources/:id", () => {
  it("updates only the provided fields", async () => {
    const created = await seed({ name: "Laptop", category: "electronics", status: "inactive" });
    const res = await request(app)
      .patch(`/resources/${created.id}`)
      .send({ description: "16GB RAM" })
      .expect(200);
    expect(res.body).toMatchObject({
      name: "Laptop",
      description: "16GB RAM",
      status: "inactive",
    });
  });

  it("rejects empty or unknown fields", async () => {
    const created = await seed({ name: "Laptop", category: "electronics" });
    await request(app).patch(`/resources/${created.id}`).send({}).expect(400);
    await request(app).patch(`/resources/${created.id}`).send({ id: 5 }).expect(400);
  });

  it("returns 404 for unknown id", async () => {
    await request(app).patch("/resources/999").send({ name: "x" }).expect(404);
  });
});

describe("DELETE /resources/:id", () => {
  it("deletes the resource", async () => {
    const created = await seed({ name: "Laptop", category: "electronics" });
    await request(app).delete(`/resources/${created.id}`).expect(204);
    await request(app).get(`/resources/${created.id}`).expect(404);
    await request(app).delete(`/resources/${created.id}`).expect(404);
  });
});

describe("persistence", () => {
  it("keeps data after the database file is reopened", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "problem5-"));
    const dbPath = path.join(dir, "test.db");
    try {
      const first = createDatabase(dbPath);
      const created = await request(createApp(first))
        .post("/resources")
        .send({ name: "Laptop", category: "electronics" })
        .expect(201);
      first.close();

      const second = createDatabase(dbPath);
      const res = await request(createApp(second)).get(`/resources/${created.body.id}`).expect(200);
      expect(res.body.name).toBe("Laptop");
      second.close();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
