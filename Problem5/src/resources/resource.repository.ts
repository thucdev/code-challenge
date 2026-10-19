import type { DB } from "../db";
import type {
  CreateResourceInput,
  ListResourcesQuery,
  Resource,
  UpdateResourceInput,
} from "./resource.schema";

interface ResourceRow {
  id: number;
  name: string;
  description: string;
  category: string;
  status: Resource["status"];
  created_at: string;
  updated_at: string;
}

const SORT_COLUMNS: Record<ListResourcesQuery["sortBy"], string> = {
  name: "name",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

function toResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ResourceRepository {
  constructor(private readonly db: DB) {}

  create(input: CreateResourceInput): Resource {
    const now = new Date().toISOString();
    const result = this.db
      .prepare(
        `INSERT INTO resources (name, description, category, status, created_at, updated_at)
         VALUES (@name, @description, @category, @status, @now, @now)`,
      )
      .run({ ...input, now });
    return this.findById(Number(result.lastInsertRowid))!;
  }

  findById(id: number): Resource | undefined {
    const row = this.db
      .prepare(`SELECT * FROM resources WHERE id = ?`)
      .get(id) as ResourceRow | undefined;
    return row && toResource(row);
  }

  list(query: ListResourcesQuery): { items: Resource[]; total: number } {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (query.name) {
      conditions.push(`name LIKE @name ESCAPE '\\'`);
      params.name = `%${query.name.replace(/[\\%_]/g, "\\$&")}%`;
    }
    if (query.category) {
      conditions.push(`category = @category`);
      params.category = query.category;
    }
    if (query.status) {
      conditions.push(`status = @status`);
      params.status = query.status;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderBy = `${SORT_COLUMNS[query.sortBy]} ${query.order === "asc" ? "ASC" : "DESC"}, id ${query.order === "asc" ? "ASC" : "DESC"}`;

    const { total } = this.db
      .prepare(`SELECT COUNT(*) AS total FROM resources ${where}`)
      .get(params) as { total: number };

    const rows = this.db
      .prepare(
        `SELECT * FROM resources ${where} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`,
      )
      .all({ ...params, limit: query.limit, offset: query.offset }) as ResourceRow[];

    return { items: rows.map(toResource), total };
  }

  update(id: number, input: UpdateResourceInput): Resource | undefined {
    const fields = Object.keys(input) as (keyof UpdateResourceInput)[];
    if (fields.length === 0) return this.findById(id);

    const assignments = fields.map((field) => `${field} = @${field}`).join(", ");
    const result = this.db
      .prepare(`UPDATE resources SET ${assignments}, updated_at = @now WHERE id = @id`)
      .run({ ...input, now: new Date().toISOString(), id });

    return result.changes > 0 ? this.findById(id) : undefined;
  }

  delete(id: number): boolean {
    return this.db.prepare(`DELETE FROM resources WHERE id = ?`).run(id).changes > 0;
  }
}
